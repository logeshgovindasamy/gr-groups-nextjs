import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getAllProducts as getLegacyProducts } from "@/services/product.service";
import { mapWooCommerceProduct, getCategories as getWooCategories } from "@/services/productService";
import { woocommerce } from "@/lib/woocommerce";

export const dynamic = "force-dynamic";

// Generate a stable, valid Picsum image URL that has a clean .jpg extension
function getValidImageUrl(imgUrl, categoryName, productName) {
  // Generate a stable number from the product name
  let hash = 0;
  const nameStr = productName || "product";
  for (let i = 0; i < nameStr.length; i++) {
    hash = nameStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const photoId = Math.abs(hash % 80) + 10; // stable photo ID
  return `https://picsum.photos/id/${photoId}/600/400.jpg`;
}

export async function GET() {
  const log = [];
  const status = {
    products: { totalLegacy: 0, alreadyMigrated: 0, newlyMigrated: 0, failed: 0 },
    users: { totalLegacy: 0, alreadyMigrated: 0, newlyMigrated: 0, failed: 0 },
    orders: { totalLegacy: 0, alreadyMigrated: 0, newlyMigrated: 0, failed: 0 }
  };

  try {
    log.push("=== Starting full database migration ===");

    // ==========================================
    // PHASE 1: PRODUCT MIGRATION
    // ==========================================
    log.push("\n--- Phase 1: Products Migration ---");
    const legacyProducts = await getLegacyProducts();
    status.products.totalLegacy = legacyProducts.length;

    // Fetch directly from WooCommerce REST API
    const rawWooProducts = await woocommerce.get("products", { per_page: 100 });
    const existingWooProducts = (rawWooProducts || []).map(mapWooCommerceProduct);
    
    const wooCategories = await getWooCategories();
    const categoryCache = [...wooCategories];

    // Helper to get or create a WooCommerce category
    async function getOrCreateCategory(categoryName) {
      if (!categoryName) categoryName = "General";
      const normalizedName = categoryName.trim();
      let matched = categoryCache.find(
        c => c.name.toLowerCase() === normalizedName.toLowerCase()
      );
      if (matched) return matched.id;

      try {
        log.push(`Creating category: "${normalizedName}"...`);
        const newCatRes = await woocommerce.post("products/categories", {
          name: normalizedName
        });
        if (newCatRes && newCatRes.id) {
          categoryCache.push({ id: newCatRes.id, name: newCatRes.name });
          return newCatRes.id;
        }
      } catch (catErr) {
        log.push(`⚠️ Failed to create category "${normalizedName}": ${catErr.message}`);
      }
      return null;
    }

    for (const legacy of legacyProducts) {
      const normalizedName = (legacy.name || legacy.title || "").trim();
      const alreadyExists = existingWooProducts.some(
        woo => woo.name.toLowerCase().trim() === normalizedName.toLowerCase()
      );

      if (alreadyExists) {
        status.products.alreadyMigrated++;
        continue;
      }

      const categoryId = await getOrCreateCategory(legacy.category);
      
      // Map to valid images WooCommerce can fetch
      const wooImages = [
        { src: getValidImageUrl(legacy.image, legacy.category, normalizedName) }
      ];

      const wooPayload = {
        name: normalizedName,
        type: "simple",
        regular_price: String(legacy.price || 0),
        description: legacy.description || "",
        manage_stock: true,
        stock_quantity: parseInt(legacy.stock !== undefined ? legacy.stock : 0),
        status: "publish",
        images: wooImages,
        categories: categoryId ? [{ id: categoryId }] : []
      };

      try {
        const newWooProduct = await woocommerce.post("products", wooPayload);
        if (newWooProduct && newWooProduct.id) {
          status.products.newlyMigrated++;
          log.push(`✅ Migrated Product: "${normalizedName}" (ID: ${newWooProduct.id})`);
        }
      } catch (err) {
        status.products.failed++;
        const detailedError = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        log.push(`❌ Failed Product "${normalizedName}": ${detailedError}`);
      }
    }
    log.push(`Product migration completed. Migrated: ${status.products.newlyMigrated}, Skipped: ${status.products.alreadyMigrated}`);

    // ==========================================
    // PHASE 2: USERS MIGRATION
    // ==========================================
    log.push("\n--- Phase 2: Users Migration ---");
    let legacyUsers = [];
    try {
      const usersFilePath = path.join(process.cwd(), ".users-fallback.json");
      const usersRaw = await fs.readFile(usersFilePath, "utf8");
      legacyUsers = JSON.parse(usersRaw);
    } catch (usersFileErr) {
      log.push(`⚠️ No legacy users fallback file found: ${usersFileErr.message}`);
    }

    status.users.totalLegacy = legacyUsers.length;

    // Fetch existing WooCommerce customers
    let existingCustomers = [];
    try {
      existingCustomers = await woocommerce.get("customers", { per_page: 100 });
    } catch (custErr) {
      log.push(`⚠️ Failed to load WooCommerce customers: ${custErr.message}`);
    }

    // Mapping dictionary: legacy_userId -> woo_customerId
    const userMapping = {};

    for (const user of legacyUsers) {
      if (!user.email) continue;
      
      const email = user.email.toLowerCase().trim();
      const existingCustomer = existingCustomers.find(
        c => c.email.toLowerCase().trim() === email
      );

      if (existingCustomer) {
        userMapping[user.id] = existingCustomer.id;
        status.users.alreadyMigrated++;
        continue;
      }

      log.push(`Migrating user: ${user.name} (${email})...`);
      const nameParts = (user.name || "Legacy User").split(" ");
      const firstName = nameParts[0] || "Legacy";
      const lastName = nameParts.slice(1).join(" ") || "User";

      const customerPayload = {
        email: email,
        first_name: firstName,
        last_name: lastName,
        username: email.split("@")[0] + "_" + Math.floor(Math.random() * 1000),
        billing: {
          first_name: firstName,
          last_name: lastName,
          email: email
        },
        shipping: {
          first_name: firstName,
          last_name: lastName
        }
      };

      try {
        const newCustomer = await woocommerce.post("customers", customerPayload);
        if (newCustomer && newCustomer.id) {
          userMapping[user.id] = newCustomer.id;
          status.users.newlyMigrated++;
          log.push(`✅ Migrated User: "${user.name}" (Woo Customer ID: ${newCustomer.id})`);
        }
      } catch (err) {
        status.users.failed++;
        const detailedError = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        log.push(`❌ Failed User "${user.name}": ${detailedError}`);
      }
    }
    log.push(`User migration completed. Migrated: ${status.users.newlyMigrated}, Skipped: ${status.users.alreadyMigrated}`);

    // ==========================================
    // PHASE 3: ORDERS MIGRATION
    // ==========================================
    log.push("\n--- Phase 3: Orders Migration ---");
    let legacyOrders = [];
    try {
      const ordersFilePath = path.join(process.cwd(), ".orders-fallback.json");
      const ordersRaw = await fs.readFile(ordersFilePath, "utf8");
      legacyOrders = JSON.parse(ordersRaw);
    } catch (ordersFileErr) {
      log.push(`⚠️ No legacy orders fallback file found: ${ordersFileErr.message}`);
    }

    status.orders.totalLegacy = legacyOrders.length;

    // Fetch existing WooCommerce orders to check metadata legacy_order_id
    let existingWooOrders = [];
    try {
      existingWooOrders = await woocommerce.get("orders", { per_page: 100 });
    } catch (ordersErr) {
      log.push(`⚠️ Failed to load WooCommerce orders list: ${ordersErr.message}`);
    }

    // Refresh WooCommerce products list directly to get numeric IDs
    const latestRawWooProducts = await woocommerce.get("products", { per_page: 100 });
    const productsList = (latestRawWooProducts || []).map(mapWooCommerceProduct);

    for (const order of legacyOrders) {
      const legacyOrderId = order.id || order.sk?.replace("ORDER#", "");
      if (!legacyOrderId) continue;

      // Check if already migrated
      const isAlreadyMigrated = existingWooOrders.some(wooOrder => {
        const meta = wooOrder.meta_data || [];
        return meta.some(m => m.key === "legacy_order_id" && m.value === legacyOrderId);
      });

      if (isAlreadyMigrated) {
        status.orders.alreadyMigrated++;
        continue;
      }

      log.push(`Migrating order: ${legacyOrderId}...`);

      // Resolve customer ID
      const wooCustomerId = userMapping[order.userId] || 0;

      // Resolve products list to line items
      const wooLineItems = (order.orderItems || []).map(item => {
        const matchedProduct = productsList.find(
          p => p.name.toLowerCase().trim() === item.name.toLowerCase().trim()
        );

        return {
          product_id: matchedProduct ? Number(matchedProduct.id) : null,
          name: item.name,
          quantity: parseInt(item.qty || 1),
          price: String(item.price || 0),
          total: String((item.price || 0) * (item.qty || 1))
        };
      });

      const shipping = order.shippingAddress || {};
      const firstName = order.shippingAddress?.name || "Customer";

      const orderPayload = {
        customer_id: wooCustomerId,
        payment_method: order.paymentMethod === "Credit Card" ? "stripe" : "cod",
        payment_method_title: order.paymentMethod || "Credit Card",
        set_paid: !!order.isPaid,
        status: order.isPaid ? "processing" : "pending",
        billing: {
          first_name: firstName,
          address_1: shipping.address || "123 Main St",
          city: shipping.city || "Metropolis",
          postcode: shipping.postalCode || "12345",
          country: shipping.country || "US"
        },
        shipping: {
          first_name: firstName,
          address_1: shipping.address || "123 Main St",
          city: shipping.city || "Metropolis",
          postcode: shipping.postalCode || "12345",
          country: shipping.country || "US"
        },
        line_items: wooLineItems,
        meta_data: [
          { key: "legacy_order_id", value: legacyOrderId }
        ]
      };

      try {
        const newWooOrder = await woocommerce.post("orders", orderPayload);
        if (newWooOrder && newWooOrder.id) {
          status.orders.newlyMigrated++;
          log.push(`✅ Migrated Order: "${legacyOrderId}" (Woo Order ID: ${newWooOrder.id})`);
        }
      } catch (err) {
        status.orders.failed++;
        const detailedError = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        log.push(`❌ Failed Order "${legacyOrderId}": ${detailedError}`);
      }
    }
    log.push(`Order migration completed. Migrated: ${status.orders.newlyMigrated}, Skipped: ${status.orders.alreadyMigrated}`);

    log.push("\n=== Full database migration process finished ===");

    return NextResponse.json({
      success: true,
      status,
      log
    });

  } catch (error) {
    console.error("[Full Migration Error]", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      log
    }, { status: 500 });
  }
}

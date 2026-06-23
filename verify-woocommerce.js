require('dotenv').config({ path: '.env.local' });

// We need a simple fetch polyfill for the node script if Next.js uses global fetch
if (!global.fetch) {
  global.fetch = require('node-fetch'); // or use Axios for the test script
}

// Directly initialize the API since we are outside Next.js
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const https = require("https");
const dns = require("dns");

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const url = process.env.NEXT_PUBLIC_WP_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL || 'http://127.0.0.1/Testwp';

const api = new WooCommerceRestApi({
  url,
  consumerKey: process.env.WC_CONSUMER_KEY || process.env.WOOCOMMERCE_CONSUMER_KEY || '',
  consumerSecret: process.env.WC_CONSUMER_SECRET || process.env.WOOCOMMERCE_CONSUMER_SECRET || '',
  version: "wc/v3",
  axiosConfig: {
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
  }
});

async function verify() {
  console.log("=== Starting Automated Verification ===");

  try {
    // 1. Verify Products
    console.log("\n[1] Fetching Products...");
    const productsRes = await api.get("products", { per_page: 5 });
    const products = productsRes.data;
    console.log(`✅ Successfully fetched ${products.length} products.`);
    if (products.length > 0) {
      console.log(`   Sample Product: ${products[0].name} (ID: ${products[0].id})`);
    } else {
      console.log("   ⚠️ No products found in WooCommerce. You may need to add some.");
    }

    // 2. Test Creating an Order
    console.log("\n[2] Creating a Test Order...");
    const testOrder = {
      payment_method: "bacs",
      payment_method_title: "Direct Bank Transfer",
      set_paid: false,
      billing: {
        first_name: "Automated",
        last_name: "Test",
        email: "test@example.com",
      },
      line_items: products.length > 0 ? [
        {
          product_id: products[0].id,
          quantity: 1
        }
      ] : [] // If no products, we can't add line items
    };

    if (testOrder.line_items.length > 0) {
      const orderRes = await api.post("orders", testOrder);
      const createdOrder = orderRes.data;
      console.log(`✅ Successfully created Test Order (ID: ${createdOrder.id}).`);
      
      // 3. Verify Order Retrieval
      console.log("\n[3] Verifying Order Retrieval...");
      const fetchOrderRes = await api.get(`orders/${createdOrder.id}`);
      console.log(`✅ Successfully retrieved Order ID: ${fetchOrderRes.data.id}.`);
    } else {
      console.log("   ⚠️ Skipping order creation because there are no products to purchase.");
    }

    console.log("\n=== Automated Verification Completed Successfully! ===");
  } catch (error) {
    console.error("\n❌ Verification Failed:");
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

verify();

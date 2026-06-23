/**
 * migrate-products.js
 * Migrates product data from AWS DynamoDB to custom WordPress MySQL table via GraphQL.
 * Run using: node migrate-products.js
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = require('dotenv').parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const WP_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'http://localhost/Testwp/graphql';

async function scanDynamoDB() {
  console.log("Connecting to AWS DynamoDB...");
  console.log(`Region: ${process.env.AWS_REGION || 'ap-south-2'}`);
  console.log(`Table: ${process.env.DYNAMODB_TABLE_NAME || 'E-commerce-main'}`);

  const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-south-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  
  const docClient = DynamoDBDocumentClient.from(client);
  const tableName = process.env.DYNAMODB_TABLE_NAME || 'E-commerce-main';

  try {
    const command = new ScanCommand({ TableName: tableName });
    const result = await docClient.send(command);
    const items = result.Items || [];
    console.log(`Scan success! Found ${items.length} total records in DynamoDB.`);
    
    // Filter out users, orders, settings, etc. to get only products
    const products = items.filter(item => {
      const isProductPk = typeof item.pk === 'string' && item.pk.toUpperCase() === 'PRODUCT';
      const hasProductProps = item.price !== undefined || item.category || item.stock !== undefined || item.title || item.name;
      
      const isUser = typeof item.pk === 'string' && item.pk.toUpperCase() === 'USER';
      const isOrder = item.orderItems || item.shippingAddress || (typeof item.pk === 'string' && item.pk.toUpperCase() === 'ORDER');
      const isSettings = typeof item.pk === 'string' && item.pk.toUpperCase() === 'SETTINGS';
      
      return (isProductPk || hasProductProps) && !isUser && !isOrder && !isSettings;
    });

    console.log(`Filtered and found ${products.length} product records.`);
    return products;
  } catch (error) {
    console.error("❌ DynamoDB scan failed:", error.message);
    return [];
  }
}

async function uploadToGraphQL(product) {
  const mutation = `
    mutation CreateProduct($input: createGrGroupProductInput!) {
      createGrGroupProduct(input: $input) {
        success
        productId
      }
    }
  `;

  // Make sure image paths are absolute or well-formed
  let images = product.images || [];
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch (e) {
      images = [images];
    }
  }
  
  // Map local paths to Unsplash fallbacks just in case
  images = images.map(img => {
    if (typeof img === 'string' && img.startsWith('/products/')) {
      const filename = img.split('/').pop();
      const fallbacks = {
        'hoodie-neon.jpg': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop',
        'hoodie-neon-v2.jpg': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop',
        'jacket-obsidian.jpg': 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600&auto=format&fit=crop',
        'shoes-phantom.jpg': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
        'blazer-velvet.jpg': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
        'watch-titanium.jpg': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop',
        'silk-squares.jpg': 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600&auto=format&fit=crop',
        'wallet-leather.jpg': 'https://images.unsplash.com/photo-1508962914676-134849a727f0?q=80&w=600&auto=format&fit=crop',
        'turtleneck-merino.jpg': 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop',
        'sunglasses-artisan.jpg': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop',
        'belt-carbon.jpg': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop',
        'pants-cargo.jpg': 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=600&auto=format&fit=crop'
      };
      return fallbacks[filename] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop';
    }
    return img;
  });

  const variables = {
    input: {
      id: product.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: product.name || product.title || 'Unnamed Product',
      description: product.description || '',
      price: parseFloat(product.price || 0),
      category: product.category || 'General',
      stock: parseInt(product.stock || 0),
      images: images,
      isNewArrival: !!(product.isNewArrival)
    }
  };

  const response = await fetch(WP_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: mutation, variables })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText}`);
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(JSON.stringify(json.errors));
  }

  return json.data.createGrGroupProduct;
}

async function run() {
  console.log("=== Beginning AWS to WordPress DB GraphQL Migration ===");
  const products = await scanDynamoDB();

  if (products.length === 0) {
    console.log("❌ No products fetched from DynamoDB. Aborting migration.");
    return;
  }

  let successCount = 0;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const name = p.name || p.title || 'Unnamed';
    console.log(`[${i+1}/${products.length}] Migrating: "${name}" (ID: ${p.id})...`);
    try {
      const res = await uploadToGraphQL(p);
      if (res.success) {
        console.log(`   ✅ Success! Imported to WordPress. Product ID: ${res.productId}`);
        successCount++;
      } else {
        console.error(`   ❌ WordPress mutation returned failure for: ${name}`);
      }
    } catch (error) {
      console.error(`   ❌ Migration failed for "${name}": ${error.message}`);
    }
  }

  console.log(`\n=== Migration Process Finished: Imported ${successCount}/${products.length} products successfully! ===`);
}

run();

const fetch = require('node-fetch');

async function testSchema() {
  console.log("=== Testing WordPress WPGraphQL Schema ===");
  const query = `
    query {
      __type(name: "RootQuery") {
        fields {
          name
          description
        }
      }
    }
  `;

  try {
    const res = await fetch('http://localhost/Testwp/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    const json = await res.json();
    const fields = json.data.__type.fields;
    
    const customFields = fields.filter(f => f.name.startsWith('grGroupProduct'));
    console.log("Found custom GraphQL fields matching 'grGroupProduct':", customFields);

    if (customFields.length > 0) {
      console.log("✅ Custom table schemas successfully registered in WPGraphQL!");
    } else {
      console.error("❌ Custom table schemas not found in RootQuery. Please check plugin activation.");
    }
  } catch (error) {
    console.error("❌ GraphQL Query Failed:", error.message);
  }
}

testSchema();

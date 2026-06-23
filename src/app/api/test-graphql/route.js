import { NextResponse } from 'next/server';

export async function GET() {
  const query = `
    query GetProducts {
      products(first: 10) {
        nodes {
          id
          databaseId
          name
          description
          shortDescription
          image {
            sourceUrl
          }
          galleryImages {
            nodes {
              sourceUrl
            }
          }
          ... on SimpleProduct {
            price
            regularPrice
            salePrice
            stockStatus
            stockQuantity
          }
          productCategories {
            nodes {
              name
            }
          }
        }
      }
    }
  `;

  try {
    const url = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'http://localhost/Testwp/graphql';
    console.log("Sending GraphQL query to:", url);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      throw new Error(`WordPress GraphQL returned status: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json({ success: true, url, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

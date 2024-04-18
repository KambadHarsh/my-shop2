import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "./shopify.js";

const CREATE_PRODUCTS_MUTATION = `
  mutation populateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
        productType
        descriptionHtml
        vendor
      }
    }
  }
`;

/**
 * Create a product in Shopify using given product data.
 * @param {Object} session - Shopify session object.
 * @param {Object} productData - Product data containing title, price, description, type, and vendor.
 */
export default async function productCreator(session, productData) {
  const client = new shopify.api.clients.Graphql({ session });

  const input = {
    title: productData.title,
    variants: [{
      price: productData.price.toString(),  // Ensure price is a string if required by the API
    }],
    descriptionHtml: productData.description || '',
    productType: productData.type || '',
    vendor: productData.vendor || '',
  };

  try {
    await client.query({
      data: {
        query: CREATE_PRODUCTS_MUTATION,
        variables: { input },
      },
    });
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(`${error.message}\n${JSON.stringify(error.response, null, 2)}`);
    } else {
      throw error;
    }
  }
}

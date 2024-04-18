

const express = require('express');
const bodyParser = require('body-parser');
const Shopify = require('shopify-api'); // Shopify API library

const app = express();
app.use(bodyParser.json());

// Replace with your Shopify API credentials
const shopifyConfig = {
  shopName: 'quickstart-956d2e42.myshopify.com',
  apiKey: '76364accc71da88aaa709bb88c1b3a61',
  password: '43b8abe068f2429c5bc7bcf9f4e6222a',
};

const shopify = new Shopify(shopifyConfig);

// API endpoint to create products from received data
app.post('/api/create-products', async (req, res) => {
  try {
    const products = req.body;
    for (const product of products) {
      await shopify.product.create(product); // Create each product
    }
    res.json({ message: 'Products created successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating products!' });
  }
});

app.listen(3000, () => console.log('Server listening on port 3000'));

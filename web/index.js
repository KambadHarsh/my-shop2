// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import shopify from "./shopify.js";
import PrivacyWebhookHandlers from "./privacy.js";
import fs from "fs";
import csv from 'csv-parser';
import multer from "multer";
import cors from 'cors';
import { createReadStream } from 'fs';
import request from "request";
import productCreator from './product-creator.js';


const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;


const app = express();
app.use(cors());

app.use(cors({
  origin: 'https://quickstart-956d2e42.myshopify.com', 
  credentials: true,
}));


// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession(), shopify.ensureInstalledOnShop());

app.use(express.json());

//read product information
app.get("/api/products/info", async (req, res) => {
  let productInfo = await shopify.api.rest.Product.all({
    session: res.locals.shopify.session,

  })
  res.status(200).send(productInfo);
})


// get meta data
app.get("/api/metafields/product", async (req, res) => {
  let metafields = await shopify.api.rest.Metafield.all({
    session: res.locals.shopify.session,
  })
  res.status(200).send(metafields);
})

// create metafields
app.get("/api/metafield/create", async (req, res) => {
  let metafield = new shopify.api.rest.Metafield({
    session: res.locals.shopify.session,
  });
  metafield.product_id = 125694872356,
  metafield.namespace = "custom";
  metafield.key = "unit_price";
  metafield.type = "number_integer";
  metafield.value = "50";
  await metafield.save({
    update: true,
  })
  res.status(200).send(metafield);
})

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*",(_req, res) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});



//  to upload csv


// Setup multer for file handling

const upload = multer({ dest: 'uploads/' });
app.post('/api/products/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Extract shop details, API key, and password from the request or use defaults
  const { shop, apiKey, password } = req.body;
  const shopName = shop || 'quickstart-956d2e42.myshopify.com'; 
  const apiKeyValue = apiKey || '76364accc71da88aaa709bb88c1b3a61'; 
  const passwordValue = password || 'shpua_9e8bb0e648bbaf2bd003667e4584a7cb'; 

  // Parse CSV file
  const parser = createReadStream(req.file.path).pipe(csv({
    mapHeaders: ({ header }) => header.trim(), // Trim header names
    mapValues: ({ header, index, value }) => value.trim(), // Trim cell values
  }));

  try {
    for await (const record of parser) {
      await productCreator(res.locals.shopify.session, {
        title: record.title,
        price: record.price,
        description: record.description,
        type: record.type,
        vendor: record.vendor,
      });
    }

    fs.unlinkSync(req.file.path); // Clean up uploaded file
    res.status(200).send({ message: 'Products created successfully' });
  } catch (error) {
    console.error('Failed to process CSV:', error);
    fs.unlinkSync(req.file.path); // Clean up uploaded file
    res.status(500).send('Failed to create products from CSV.');
  }
});



// const apiKey = '3cc17928f382c3fec81e54e049b745e8';
// const apiPassword = 'shpua_9e8bb0e648bbaf2bd003667e4584a7cb';
// let endpoint = 'products';




// Endpoint to handle CSV upload and product creation
// app.post('/uploadCSV', upload.single('csvFile'), (req, res) => {
//   const file = req.file; // Access the uploaded file using req.file
//   if (!file) {
//       return res.status(400).send('No file uploaded.');
//     }
//   const products = [];

//   fs.createReadStream(file.path)
//       .pipe(csv())
//       .on('data', (row) => {
//           // Process each row of the CSV to extract product information
//           const product = {
//               title: row.title,
//               body_html: row.body_html,
//               vendor: row.vendor,
//               product_type: row.product_type,
//               created_at: row.created_at,
//               handle: row.handle,
//               updated_at: row.updated_at,
//               published_at: row.published_at,
//               template_suffix: row.template_suffix,
//               published_scope: row.published_scope,
//               tags: row.tags,
//               status: row.status
//           };
//           products.push(product);
//       })
//       .on('end', () => {
//           // Send a request to Shopify API for each product in the CSV
//           products.forEach((product) => {
//               const createProduct = {
//                   method: 'POST',
//                   url: `https://${apiKey}:${apiPassword}@quickstart-956d2e42.myshopify.com/admin/api/2024-04/${endpoint}.json`,
//                   headers: {
//                       'content-type': 'application/json',
//                       'Authorization': `Basic ${Buffer.from(apiKey + ':' + apiPassword).toString('base64')}`
//                   },
//                   body: JSON.stringify({ product })
//               };

//               request(createProduct, (error, response, body) => {
//                   if (error) throw new Error(error);
//                   // console.log(body); // Log the Shopify API response
//               });
//           });


//           res.status(200).send('Products created successfully.');
//       });
// });




// app.use(cors());



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
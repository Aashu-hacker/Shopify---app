// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import mongoose from "mongoose";
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";
import SaveProduct from "./models/SaveProduct.js";
import SaveURL from "./models/SaveURL.js";

//---DataBase Connection-----------//

function connectDB() {

  mongoose.set('strictQuery', false);

  mongoose.connect("mongodb+srv://admin:aashu2104@cluster0.gmzba1y.mongodb.net/Shopify")
    .then(() => console.log("DB CONNECTED"))
    .catch((error) => console.log("DB FAILEDDD"));
}
connectDB()

//---DataBase Connection-----------//


// @ts-ignore
const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();


// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  // @ts-ignore
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);




// All endpoints after this point will require an active session
app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

app.get("/api/products/get", async (_req, res) => {
  const fetchData = await shopify.api.rest.Product.all({
    session: res.locals.shopify.session,
  });
  res.status(200).send(fetchData);
});

app.use(express.json());
app.post("/api/custom/fetch", async (_req, res) => {
  const request = _req.body;
  const response = {
    url: request.url
  }
  console.log(response);
  res.status(200).send({...response });
});




app.post("/api/products/new", async (_req, res) => {
  const data = _req.body.create;

  for (let i = 0; i < data.length; i++) {
    let Upadated_data = data[i];
    console.log(Upadated_data);
    const product = new shopify.api.rest.Product({ session: res.locals.shopify.session, });
    product.title = Upadated_data.title;
    product.body_html = "<strong>Good snowboard!</strong>";
    product.status = "draft";
    product.images = [
      {
        "src": Upadated_data.thumbnail,
      }
    ];
    await product.save({
      update: true,
    });
    res.status(200).send(console.log("sucess"));
  }

});

//-------Store  and fetch Products Route-------//

app.post("/api/products/all", async (_req, res) => {


  const fetchData = await shopify.api.rest.Product.all({
    session: res.locals.shopify.session,
  });
  const saveProductData = new SaveProduct({

    products: fetchData,

  });
  await saveProductData.save();

  res.status(200).send(fetchData);
});


// app.post("/api/custom/fetch", async (_req, res) => {
//   const response = _req.body;
//   const saveURLData = new SaveURL({
//       url: response.url
//     });
//   await saveURLData.save();
//    console.log(response);
//   res.status(200).send({...response});
// });

app.get("/api/custom/find", async (_req, res) => {
  const saveURLData = await SaveURL.find({});
  console.log(saveURLData[0].url);
  const url = saveURLData[0].url
   res.status(200).send({url: url});
});


//-------Store  and fetch Products Route-------//

app.post("/api/products/create", async (_req, res) => {
  const productData = _req.body;

  let status = 200;
  let error = null;
  try {
    const response = await productCreator(res.locals.shopify.session, productData);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});


app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);

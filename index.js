const express = require('express');
const serverless = require('serverless-http');
require('dotenv').config();
const cors = require('cors');
const crypto = require('crypto');

const variants = require('./routes/variant')
const calculators = require('./routes/calculator')
const assets = require('./routes/asset');
const { adjustInventoryHelper } = require('./helpers/helpers.variant');

const app = express();

// app.use(cors({
//     origin: ['https://imprivicshop.com','https://imprivic-shop.myshopify.com','http://localhost:5173']
// }));

app.use(cors());

app.use(express.json({
  verify: (req,res,buf) => {
    req.rawBody = buf.toString(); // store the raw body as a string
  }
}));

app.use('/api/variant', variants);
app.use('/calculate', calculators);
app.use('/asset', assets);


app.post("/webhooks/orders-create", async (req, res) => {
  const hmac = req.get("X-Shopify-Hmac-Sha256");
  const rawBody = req.rawBody;

  const generated = crypto
    .createHmac("sha256", process.env.SHOPIFY_SECRET_KEY)
    .update(rawBody, "utf8")
    .digest("base64");

  if (crypto.timingSafeEqual(Buffer.from(hmac, 'base64'), Buffer.from(generated, 'base64'))) {
    console.log("✅ Valid webhook:", req.body);
    const order = req.body;
    await adjustInventoryHelper(order);
    res.sendStatus(200);
  } else {
    console.warn("❌ Invalid webhook signature");
    res.sendStatus(401);
  }
});

app.get("/testing",function(req,res){
  return res.send("Working...")
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;
module.exports.handler = serverless(app);

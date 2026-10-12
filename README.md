# Get Fabulous API (portfolio copy)

Express API for Shopify product variants, a print calculator, Cloudinary uploads, and order webhooks. Deployable on AWS Lambda (Serverless) or Vercel.

This public copy has **no Shopify tokens, Cloudinary secrets, or Serverless deploy state**. Copy `.env.example` to `.env` and use your own values.

## Local run

```bash
cd Get-Fabulous-API-master
npm install
cp .env.example .env
npm run dev
```

Required env: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ACCESS_TOKEN`, `SHOPIFY_SECRET_KEY`, `SHOPIFY_LOCATION_ID`. Cloudinary vars are required for `/asset` uploads.

## Deploy (Lambda)

```bash
npm run deploy
```

Serverless reads the same env names from your shell or CI secrets. Do not put tokens in `serverless.yml`.

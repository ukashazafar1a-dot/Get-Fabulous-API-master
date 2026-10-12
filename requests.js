const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

const GraphQL_URL = 'https://'+SHOPIFY_STORE_DOMAIN+'/admin/api/2021-04/graphql.json';

async function getVariantsCount(product_id){
    try {
        const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/2021-04/products/${product_id}/variants/count.json`,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
            }
        })
        const responseBody = await response.json();
        return responseBody.count;   
    } catch (error) {
        console.log(error)
        return 0;
    }
}

async function getProductsByTag(tag){
    const graphqlQuery = JSON.stringify({
        query: `{
            products(first: 10, reverse: true, query: "tag:${tag}") {
                edges {
                    node {
                        id
                        title
                        featuredImage {
                            id
                        }
                    }
                }
            }
        }`
    });

    try {
        const response = await fetch(GraphQL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
            },
            body: graphqlQuery
        });

        const responseBody = await response.json();
        console.log("response body", responseBody)
        return responseBody.data.products.edges;
    }catch(error){
        console.log(error)
        return [];
    }
}

async function postNewProductWithVariant(title,bundle_title,price,tag,weight,weight_unit,requires_shipping){
    const data = {
        product:{
            title: bundle_title,
            published: true,
            published_scope: 'web',
            status: 'active',
            tags: tag,
            variants:[
                {
                    option1:title,
                    price: parseFloat(price)/100,
                    weight,
                    weight_unit,
                    requires_shipping,
                    inventory_policy: 'continue'
                }
            ]
        }
    };

    try {
        const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-07/products.json`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
            },
            body: JSON.stringify(data)
        })
        const responseBody = await response.json();
        return responseBody.product;
    } catch (error) {
        console.log(error)
        return null;
    }
}

async function postNewVariant(id,title,price,weight,weight_unit,requires_shipping) {
    const data = {
        variant:{
            option1:title,
            price:parseFloat(price)/100,
            weight,
            weight_unit,
            requires_shipping,
            inventory_policy: 'continue'
        }
    };

    try {
        const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-07/products/${id}/variants.json`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
            },
            body: JSON.stringify(data)
        })
        const responseBody = await response.json();
        return responseBody.variant;
    } catch (error) {
        console.log(error)
        return null;
    }
}

async function postVariantImage(product_id,variant_id,image){
    const data = {
        image:{
            variant_ids:[variant_id],
            src:image,
        }
    };

    try {
        const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-07/products/${product_id}/images.json`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
            },
            body: JSON.stringify(data)
        })
        const responseBody = await response.json();
        return responseBody;
    } catch (error) {
        console.log(error)
        return null;
    }
}

async function adjustInventory(variantId, qty) {

 try {
    // 1. Get inventory_item_id
    const variantRes = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-07/variants/${variantId}.json`, {
        headers: { "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN }
    });
    const variant = (await variantRes.json()).variant;
    console.log("Test2", variantRes.status, variant?.id, SHOPIFY_STORE_DOMAIN)
    const inventoryItemId = variant.inventory_item_id;

    // 2. Choose your location (hard-code or fetch once and cache)
    const locationId = process.env.SHOPIFY_LOCATION_ID;

    // 3. Adjust stock
    await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-07/inventory_levels/adjust.json`, {
        method: "POST",
        headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
            location_id: locationId,
            inventory_item_id: inventoryItemId,
            available_adjustment: -qty
        })
    });
 } catch (error) {
    console.error("While adjusting inventory: ",error)
 }

}


exports.getVariantsCount = getVariantsCount;
exports.getProductsByTag = getProductsByTag;
exports.postNewProductWithVariant = postNewProductWithVariant;
exports.postVariantImage = postVariantImage;
exports.postNewVariant = postNewVariant;
exports.adjustInventory = adjustInventory;
const { postNewProductWithVariant, postVariantImage, postNewVariant, adjustInventory } = require("../requests");

async function create_product(title,bundle_title,price,tag,image,weight=0.0,weight_unit='kg',requires_shipping=true){
    try {
        const product = await postNewProductWithVariant(title,bundle_title,price,tag,weight,weight_unit,requires_shipping);
        const variant = product?.variants[0];
        if(image) await postVariantImage(product.id,variant.id,image);
        return variant;
    } catch (error) {
        throw(error)
    }
}

async function create_variant(id,title,price,image,weight,weight_unit,requires_shipping) {
    try {
        const variant = await postNewVariant(id,title,price,weight,weight_unit,requires_shipping);
        console.log("Variant>>",variant)
        if(image) await postVariantImage(id,variant.id,image);
        return variant;
    } catch (error) {
        throw(error)
    }
}

function generateUniqueTitle(productTitle) {
    const currentDate = new Date();  
    currentDate.setHours(currentDate.getHours() + 3);
  
    // Format the date as HH:MM:SS_DD/MM/YYYY
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JS
    const year = currentDate.getFullYear();
  
    const formattedDate = `${hours}:${minutes}:${seconds}_${day}/${month}/${year}`;
  
    // Combine the product title with the formatted date
    const uniqueTitle = `${productTitle} - ${formattedDate}`;
  
    return uniqueTitle;
  }

  async function adjustInventoryHelper(order){
    const adjustments = []; // {[variantGid, quantity]}

    for(const line of order.line_items){
        const childProp = line.properties?.find(p=>p.name==='_childItemsJson');
        const lineQuantity = parseInt(line.quantity);
        console.log("Test1",childProp,lineQuantity);
        if(!childProp || !childProp?.value) continue;

        let childItems;

        try {
            childItems = JSON.parse(childProp.value);
        } catch (error) {
            console.error('❌ Failed to parse _childItemsJson for line', line.id, error);
            continue;
        }

        for(const item of childItems){
            // Extract the numeric variant ID from the gid:// string
            const variantId = item.id.match(/\d+$/)?.[0] || '';
            const qty = Number(item.quantity) || 0;

            console.log("Item",item)
            if (!variantId) {
                console.error('Missing variantId for child item', item);
                continue;
            }

            if (!variantId || qty <= 0) continue;

            await adjustInventory(variantId,(qty*lineQuantity))
        }
    }
  }


exports.create_product = create_product;
exports.create_variant = create_variant;
exports.generateUniqueTitle = generateUniqueTitle;
exports.adjustInventoryHelper = adjustInventoryHelper;
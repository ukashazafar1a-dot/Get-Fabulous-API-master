const { getVariantsCount, getProductsByTag } = require('../requests');
const { create_product, create_variant, generateUniqueTitle } = require('../helpers/helpers.variant');

const getVariantID = async (req,res) => {
    const {title,bundle_title,price,tag,weight,weight_unit,requires_shipping,image} = req.body;
    try {

    let finalImage = image;

    const uniqueTitle = generateUniqueTitle(title);
    let product_id = null;
    let variant_count = null;
    let variant = null;

        const products = await getProductsByTag(tag);
        const size = products.length;
        if(size > 0){
            const parts = products[0].node.id.split('/');
            product_id = parts[parts.length - 1];
            variant_count = await getVariantsCount(product_id);
        }
        if(size <= 0){
            //Create product and get variant
            variant = await create_product(uniqueTitle,bundle_title,price,tag,finalImage,weight,weight_unit,requires_shipping)
        }else{
            if(variant_count < 2000){
                variant = await create_variant(product_id,uniqueTitle,price,finalImage,weight,weight_unit,requires_shipping)
            }else{
                variant = await create_product(uniqueTitle,bundle_title,price,tag,finalImage,weight,weight_unit,requires_shipping)
            }
        }
        return res.status(200).json({
            status: 'success',
            Result: products,
            count: size,
            variant,
            variant_count,
            product_id,
            file: finalImage
        });
    } catch (error) {
        console.log("Error>>",error)
        return res.status(203).json({
            status: 'error',
            message: 'Something went wrong',
            'description': error?.message
        })
    }
}

exports.getVariantID = getVariantID;
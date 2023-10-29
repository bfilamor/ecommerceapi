const Product = require("../models/Product");
const User = require("../models/User");
const ProductAddOn = require("../models/ProductAddOn");
const Order = require("../models/Order")
const bcrypt = require("bcrypt");

//Auth
const auth = require("../auth");

module.exports.addProductAddOn = (req, res) => {
    const { name, description, price, category, brand, isPrescription } = req.body;
    let newProductAddOn = new ProductAddOn({
        name: name,
        description: description,
        price: price,
        category: category,
        brand: brand,
        isPrescription:isPrescription
    });
    return newProductAddOn.save().then((product, error) => {
        if (error) {
            return res.send(false);
        } else {
            return res.send(true);
        }
    }).catch(error => res.send(error))
}


//get all products
module.exports.getAllProductAddons = async (req, res) => {
    try {
        const product = await ProductAddOn.find({isActive:true});
        return res.send(product)

    } catch (error) {
        res.send(false)
    }

}

//get all prescription products
module.exports.getAllPrescriptionAddons = async (req, res) => {
    try {
        const product = await ProductAddOn.find({isActive:true, isPrescription:true});
        return res.send(product)

    } catch (error) {
        res.send(false)
    }

}

//get all prescription products
module.exports.getAllNonPrescriptionAddons = async (req, res) => {
    try {
        const product = await ProductAddOn.find({isActive:true, isPrescription:false});
        return res.send(product)

    } catch (error) {
        res.send(false)
    }

}


//retrieve a specfic addon
module.exports.getProductAddOn = async (req, res) => {
    const { productAddOnId } = req.params;

    try {
        const result = await ProductAddOn.findById(productAddOnId);
        return res.send(result);
    } catch (error) {
        console.log("Product Add On not found");
        return res.send(false);
    }
}

//update product
module.exports.updateProductAddOn = async (req, res) => {
    const { productAddOnId } = req.params;
    const { name, description, price, category, brand, isPrescription } = req.body;
    let updatedProduct = {
        name: name,
        description: description,
        price: price,
        category: category,
        brand: brand,
        isPrescription: isPrescription
    }
    //findByIdAndUpdate(documentId, updatesToBeApplied)
    try {
        const product = await ProductAddOn.findByIdAndUpdate(productAddOnId, updatedProduct);
        return res.send(true);
    } catch (error) {
        return res.send(false);
    }

}
//archive product
module.exports.archiveProductAddOn = async (req, res) => {
    const { productAddonId } = req.params;
    try {
        const archivedProduct = await ProductAddOn.findByIdAndUpdate(productAddonId, {
            isActive: false
        });
        return res.send(true);
    } catch (error) {
        return res.send(false);
    }
}
//activate product
module.exports.activateProductAddOn = async (req, res) => {
    const { productAddonId } = req.params;
    try {
        const activatedProduct = await ProductAddOn.findByIdAndUpdate(productAddonId, {
            isActive: true
        });
        return res.send(true);
    } catch (error) {
        return res.send(false);
    }
}



//add stocks
/* module.exports.addProductStocks = async (req, res) => {
    if (!req.user.isAdmin) {
        console.log("You do not have permission to perform this action.")
        return res.send(false)
    }
    try {
        await Product.findByIdAndUpdate(req.params.productId, { stocks: req.body.stocks }).then(() => {
            return res.send(true)
        });

    } catch (error) {
        return res.send(false)
    }
} */
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order")
const bcrypt = require("bcrypt");
const path = require('path');
const multer = require("multer");


//Auth
const auth = require("../auth");


module.exports.addProduct = (req, res) => {
    const { name, description, price, category, brand, stocks, isPrescription, productPhoto } = req.body;

    let newProduct = new Product({
        name: name,
        description: description,
        price: price,
        category: category,
        brand: brand,
        stocks: stocks,
        isPrescription: isPrescription,
        productPhoto: req.file === undefined ? false : req.file.filename
    });

    if (!req.file) {
        newProduct.productPhoto = false
    }
    return newProduct.save().then((product, error) => {
        if (error) {
            return res.send(false);
        } else {
            return res.send(true);
        }
    }).catch(error => res.send(error))
}

//created a sort criteria function to be reusable
function sortCriteriaFunction(req) {
    //create empty object
    let sortCriteria = {};
    if (req.query.rating === "highest") {
        sortCriteria = {
            averageRating: -1
        }
    } else if (req.query.rating === "lowest") {
        sortCriteria = {
            averageRating: 1
        }
    }

    if (req.query.price === "highest") {
        sortCriteria = {
            price: -1
        }
    } else if (req.query.price === "lowest") {
        sortCriteria = {
            price: 1
        }
    }

    if (req.query.sortBy == "latest") {
        sortCriteria = {
            _id: -1
        }
    } else if (req.query.sortBy == "oldest") {
        sortCriteria = {
            _id: 1
        }
    } else if (req.query.sortBy == "aToZ") {
        sortCriteria = {
            name: 1
        }
    } else if (req.query.sortBy == "zToA") {
        sortCriteria = {
            name: -1
        }
    }
    //return the targeted sortCriteria into the controller function
    return sortCriteria;
}

//get all products
module.exports.getAllProducts = async (req, res) => {
    try {
        //call the sortCriteriaFunction, then store the return values into the sortCriteria variable
        //pass req as parameter to the sortCriteriaFunction
        let sortCriteria = sortCriteriaFunction(req);
        //insert sortCrteria to sort products
        const product = await Product.find({}).sort(sortCriteria);

        return res.send(product)

    } catch (error) {
        res.send(false)
    }

}

//get all active products
module.exports.getAllActive = async (req, res) => {
    try {
        //call the sortCriteriaFunction, then store the return values into the sortCriteria variable
        //pass req as parameter to the sortCriteriaFunction
        let sortCriteria = sortCriteriaFunction(req);
        //insert sortCrteria to sort products
        const product = await Product.find({ isActive: true }).sort(sortCriteria);

        return res.send(product);


    } catch (error) {
        res.send(false)
    }
}

//get all featured products
module.exports.getAllFeaturedProducts = async (req, res) => {
    try {
        const product = await Product.find({ isActive: true, isFeatured: true });

        return res.send(product);


    } catch (error) {
        res.send(false)
    }
}


//get all products by category
module.exports.getAllProductsByCategoryAndBrand = async (req, res) => {
    try {
        const { brand } = req.query;
        const { productId } = req.params;


        //call the sortCriteriaFunction, then store the return values into the sortCriteria variable
        //pass req as parameter to the sortCriteriaFunction
        let sortCriteria = sortCriteriaFunction(req);

        //find all the products
        const products = await Product.find();

        //create a new array containing only the product brands
        const productBrands = products.map((product) => product.brand);

        //default brand criteria , returning all products
        let brandCriteria = { $in: productBrands };

        if (brand) {
            //if there is a brand query , filter the products based on the query
            brandCriteria = { $in: brand };
        }

        /* let searchTerm = {}

        if (req.query.searchTerm) {
            searchTerm = { $regex: req.query.searchTerm, $options: 'i' }
        } */

        const productsFiltered = await Product.find({ category: req.params.category, isActive: true, brand: brandCriteria }).sort(sortCriteria);

        //checks if the category is exisitng within the products.
        const categoryIndex = products.findIndex((product) => product.category == req.params.category);
        //returns -1 if the category does not exist,returning an error
        if (categoryIndex === -1 || productsFiltered.length === 0) {
            console.log("No Products for this category/brand")
            return res.send(false);
        }


        return res.send(productsFiltered);

    } catch (error) {
        console.log(error.message);
        return res.send(false);
    }
}

module.exports.searchAllProducts = async (req, res) => {
    try {

        const productsFiltered = await Product.find({ name: { $regex: req.query.searchTerm, $options: 'i' }, isActive: true }).then(result => {
            if (result.length > 0) {
                return res.send(result)
            } else {
                return res.send(false);
            }
        });

    } catch (error) {
        console.log(error.message);
        return res.send(false);
    }
}

module.exports.searchProductinCategory = async (req, res) => {
    try {
        const { brand } = req.query;
        const { productId } = req.params;


        //call the sortCriteriaFunction, then store the return values into the sortCriteria variable
        //pass req as parameter to the sortCriteriaFunction
        let sortCriteria = sortCriteriaFunction(req);

        //find all the products
        const products = await Product.find();

        //create a new array containing only the product brands
        const productBrands = products.map((product) => product.brand);

        //default brand criteria , returning all products
        let brandCriteria = { $in: productBrands };

        if (brand) {
            //if there is a brand query , filter the products based on the query
            brandCriteria = { $in: brand };
        }

        /* let searchTerm = {}

        if (req.query.searchTerm) {
            searchTerm = { $regex: req.query.searchTerm, $options: 'i' }
        } */

        const productsFiltered = await Product.find({ category: req.params.category, name: { $regex: req.query.searchTerm, $options: 'i' }, isActive: true, brand: brandCriteria }).sort(sortCriteria);

        //checks if the category is exisitng within the products.
        const categoryIndex = products.findIndex((product) => product.category == req.params.category);
        //returns -1 if the category does not exist,returning an error
        if (categoryIndex === -1 || productsFiltered.length === 0) {
            console.log("No Products for this category/brand")
            return res.send(false);
        }


        return res.send(productsFiltered);

    } catch (error) {
        console.log(error.message);
        return res.send(false);
    }
}




//retrieve a specfic product
module.exports.getProduct = (req, res) => {
    const { productId } = req.params;

    return Product.findById(productId).then(result => {
        return res.send(result)
    }).catch(error => {
        console.log("Product not found");
        return res.send(false)
    })
}

//update product
module.exports.updateProduct = async (req, res) => {
    const { productId } = req.params;
    const { name, description, price, category, brand, isPrescription, stocks, productPhoto } = req.body;

    try {
        //const product = await Product.findById(productId);

        let updatedProduct = {}
        if (req.file) {
            updatedProduct.productPhoto = req.file.filename
        }

        if (name) {
            updatedProduct.name = name
        }

        if (brand) {
            updatedProduct.brand = brand
        }

        if (description) {
            updatedProduct.description = description
        }

        if (stocks) {
            updatedProduct.stocks = stocks
        }

        if (price) {
            updatedProduct.price = price
        }

        if (category) {
            updatedProduct.category = category
        }

        if (isPrescription) {
            updatedProduct.isPrescription = isPrescription
        }



        //if(typeof req.file === "undefined")  updatedProduct.productPhoto = product.productPhoto;

        await Product.findByIdAndUpdate(productId, updatedProduct).then((product) => {
            return res.send(true)
        });

    } catch (error) {
        return res.send(false);
    }  

}
//archive product
module.exports.archiveProduct = (req, res) => {
    const { productId } = req.params;
    return Product.findByIdAndUpdate(productId, {
        isActive: false
    }).then(archivedProduct => {
        return res.send(true)
    }).catch(error => res.send(false))
}
//activate product
module.exports.activateProduct = (req, res) => {
    const { productId } = req.params;
    return Product.findByIdAndUpdate(productId, {
        isActive: true
    }).then(activatedProduct => {
        return res.send(true)
    }).catch(error => res.send(false))
}

//feature product
module.exports.featureProduct = (req, res) => {
    const { productId } = req.params;
    return Product.findByIdAndUpdate(productId, {
        isFeatured: true
    }).then(() => {
        return res.send(true)
    }).catch(error => res.send(false))
}

//feature product
module.exports.unFeatureProduct = (req, res) => {
    const { productId } = req.params;
    return Product.findByIdAndUpdate(productId, {
        isFeatured: false
    }).then(() => {
        return res.send(true)
    }).catch(error => res.send(false))
}

//add product reviews
module.exports.addReview = async (req, res) => {
    if (req.user.isAdmin) {
        console.log("You do not have permission to perform this action.")
        return res.send(false);
    }
    try {
        const { rating, comment } = req.body;
        const { productId } = req.params;
        const user = await User.findById(req.user.id);
        await Product.findById(productId).then(product => {
            /*  const userIndex = product.reviews.findIndex((review) => review.userId == req.user.id);
             
             //findIndex will return -1 , if there is no match in the array
             if (userIndex >= 0) {
                 console.log("User already added a review");
                 return res.send(false);
             } */

            let averageRating = 0;
            let newReview = {
                userId: req.user.id,
                userName: `${user.firstName} ${user.lastName}`,
                rating: rating,
                comment: comment
            }
            product.reviews.push(newReview);
            if (rating <= 5) {
                for (let i = 0; i < product.reviews.length; i++) {
                    averageRating += product.reviews[i].rating / product.reviews.length;
                }
            } else {
                console.log("Rate only from 0 to 5")
                return res.send(false)
            }

            product.averageRating = averageRating;
            return product.save().then(res.send(true))
        })

    } catch (error) {
        res.send(false)
    }
}

//get all product reviews
module.exports.getAllReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId, { reviews: 1, _id: 0 });
        //if req.query is empty, get all reviews
        if (!req.query.sortBy) {
            //return unsorted document
            return res.send(product);
        }
        //if req.query has "sortBy"
        else {
            //map product reviews into a new array
            const productReviewArr = product.reviews.map(review => {
                return review;
            })

            if (req.query.sortBy === "highest") {
                //use array sort to sort array items by highest rating value to lowest
                productReviewArr.sort((a, b) => {
                    return b.rating - a.rating;
                });


            } else if (req.query.sortBy === "lowest") {
                //use array sort to sort array items by lowest rating value to highest
                productReviewArr.sort((a, b) => {
                    return a.rating - b.rating;
                });

            }
            //return sorted array
            return res.send({ reviews: productReviewArr });

        }

    }
    catch (error) {
        res.send(false)
    }
}

//add stocks
module.exports.addProductStocks = async (req, res) => {
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
}
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const bcrypt = require("bcrypt");

//Auth
const auth = require("../auth");


module.exports.checkEmailExists = (req, res) => {
    return User.find({ email: req.body.email }).then(result => {
        if (result.length > 0) {
            return res.send(true);
        } else {
            return res.send(false);
        }
    })
}

module.exports.registerUser = async (req, res) => {
    const { email, password, firstName, lastName, homeAddress, mobileNo } = req.body;

    try {
        const user = await User.find({ email: email });
        let newUser = new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            homeAddress: homeAddress,
            mobileNo: mobileNo,
            password: bcrypt.hashSync(password, 10)
        });
        await newUser.save().then(() => {
            return res.send(true);
        })

    } catch (error) {
        return res.send(false);
    }
}

module.exports.registerNewAdmin = async (req, res) => {
    const { email, password, firstName, lastName, homeAddress, mobileNo } = req.body;

    try {

        if (!req.user.isAdmin) {
            console.log("You do not have permission to perform this action.")
            return res.send(false)
        }

        const user = await User.find({ email: email });
        let newUser = new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            mobileNo: mobileNo,
            password: bcrypt.hashSync(password, 10),
            isAdmin: true
        });
        await newUser.save().then(() => {
            return res.send(true);
        })

    } catch (error) {
        return res.send(false);
    }
}

//get all customers
module.exports.getAllCustomers = async (req, res) => {
    try {

        if (!req.user.isAdmin) {
            console.log("You do not have permission to perform this action.")
            return res.send(false)
        }
        //insert sortCrteria to sort products
        const user = await User.find({ isAdmin: false })

        return res.send(user)

    } catch (error) {
        res.send(false)
    }

}

//get all customers
module.exports.getAllAdminUsers = async (req, res) => {
    try {

        if (!req.user.isAdmin) {
            console.log("You do not have permission to perform this action.")
            return res.send(false)
        }
        //insert sortCrteria to sort products
        const user = await User.find({ isAdmin: true })

        return res.send(user)

    } catch (error) {
        res.send(false)
    }

}

module.exports.loginUser = (req, res) => {
    const { email, password } = req.body;
    return User.findOne({ email: email }).then(result => {
        //If user does not exist
        if (result == null) {
            console.log("User does not exist");
            return res.send(false);
            //If user exists
        } else {
            const isPasswordCorrect = bcrypt.compareSync(password, result.password);

            if (isPasswordCorrect) {
                res.send({
                    message: "Login Successful",
                    access: auth.createAccessToken(result)
                })
            } else {
                //retun false;
                console.log("Incorrect Password")
                return res.send(false)
            }
        }
    })
}

module.exports.getProfile = (req, res) => {
    return User.findById(req.user.id).then(result => {
        //changes the value of password for security    
        result.password = "";
        return res.send(result);
    }).catch(error => res.send(error));
}

module.exports.resetPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const { id } = req.user; // Extracting user ID from the authorization header

        // Hashing the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Updating the user's password in the database
        await User.findByIdAndUpdate(id, { password: hashedPassword });

        // Sending a success response
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Controller function to update the user profile
module.exports.updateProfile = async (req, res) => {
    try {
        // Get the user ID from the authenticated token
        const { id } = req.user;

        // Retrieve the updated profile information from the request body
        const { firstName, lastName, mobileNo } = req.body;

        // Update the user's profile in the database
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { firstName, lastName, mobileNo },
            //to show the updated document, instead of the previous version
            { new: true }
        );
        updatedUser.password = "";
        //converts res into json string  
        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
}

//update user to admin
module.exports.updateUserToAdmin = async (req, res) => {
    try {
        // Check if the user making the request has admin privileges
        if (!req.user.isAdmin) {
            console.log("You do not have permission to perform this action.")
            return res.send(false)
        }

        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.send(false);
        }

        // Update the user's role to admin
        user.isAdmin = true;
        await user.save();

        return res.send(true);

    } catch (error) {
        console.error(error);
        return res.send(false);
    }
}

//add to cart
module.exports.addToCart = async (req, res) => {
    if (req.user.isAdmin) {
        console.log("You do not have permission to perform this action.")
        return res.send(false)
    }

    try {
        //create a new array with the product ids of the cart products 
        let userCartProductsID = req.body.products.map((product) => {
            return product.productId
        });
        //search for the products with matched ids in the userCartProductIDs array
        const productPrices = await Product.find({ _id: { $in: userCartProductsID }, isActive: true }, { price: 1, name: 1 })

        const productMap = new Map();
        const productNameMap = new Map()

        // set up product map with ID as key to easily retrieve price
        productPrices.forEach(obj => {
            productMap.set(obj._id.toString(), obj.price);
            productNameMap.set(obj._id.toString(), obj.name);

        });

        let subTotal = 0;
        let totalAmount = 0;
        let addOnSubtotal = 0;

        //get the id of the user logged in
        const user = await User.findById(req.user.id);

        req.body.products.forEach((product) => {


            //using the product id as the key, get the price of the product via the productMap, then multiply it by the product quantity which the user inputted
            subTotal = productMap.get(product.productId) * product.quantity;

            if (product.addOns.length > 0) {
                product.addOns.forEach((addOn) => {
                    addOnSubtotal += addOn.price;
                })
                subTotal = (productMap.get(product.productId) * product.quantity) + addOnSubtotal;
            }

            //returns the item/object from the cartProducts array if the user inputted a duplicate cart item.
            const existingItem = user.cart.cartProducts.find(cartItem => cartItem.productId === product.productId);

            if (existingItem) {
                //add the values to the existing cart item
                existingItem.subTotal += subTotal;
                existingItem.quantity += product.quantity;

            } else {
                //append each user inputted product as an object into the cartProducts array via the spread operator
                user.cart.cartProducts.push({ ...product });
                user.cart.cartProducts.forEach((cartProduct) => {
                    if ((cartProduct.productId == product.productId)) {
                        //assign the computed subtotal into the cartProduct object
                        cartProduct.subTotal = subTotal;
                        cartProduct.productName = productNameMap.get(cartProduct.productId)
                    }

                })
            }

        });

        for (let cartProduct of user.cart.cartProducts) {
            //get the new total amount by looping each cartproducts and adding the total value of their subtotal
            totalAmount += cartProduct.subTotal;
        }

        user.cart.totalAmount = totalAmount
        await user.save().then(res.send(true))

    }
    catch (error) {
        return res.send(false)
    }
}

//delete cart item
module.exports.deleteCartItem = async (req, res) => {
    if (req.user.isAdmin) {
        console.log("Action forbidden.")
        return res.send(false)
    }
    try {
        const user = await User.findById(req.user.id, { cart: 1 })
        if (user.cart.cartProducts.length > 0) {
            //find the index of the selected item from user's cart 
            const productIndex = user.cart.cartProducts.findIndex((cartProduct) => cartProduct.productId == req.body.productId);
            //findIndex will return -1 , if there is no match in the array
            if (productIndex === -1) {
                console.log("product is not in the cart")
                return res.send(false)
            }
            const itemSelected = user.cart.cartProducts[productIndex];

            //if the product is not empty, create a filtered array where the productId sent by user is filtered out
            const newCart = user.cart.cartProducts.filter(product => {
                return product.productId !== req.body.productId;
            });

            /* //using the find method, return the deleted object of the array
            const itemSelected = user.cart.cartProducts.find(cartItem => cartItem.productId === req.body.productId); */


            if (req.body.quantity === itemSelected.quantity || !req.body.quantity) {
                //if the user inputted quantity is  equal to the quantity of the product in the cart or no quantity is given, remove the item from the cart
                //replace current cart array with the new one
                //splice from index 0 up to the last index (which is the cartarray length) 
                user.cart.cartProducts.splice(0, user.cart.cartProducts.length, ...newCart);
                //subtract the deleted item's subtotal to the totalamount of the cart   
                user.cart.totalAmount -= itemSelected.subTotal;

            } else if (req.body.quantity < itemSelected.quantity) {
                //if the user inputted quantity is less than than the current quantity, update the product values in the cart.
                //for example, if the current subtotal of 3 products is 30,000, and user wanted to reduce the quantity into 2, to get the new subtotal, we would need to get the original price first by dividing the currentsubtotal by the current quantity (30,000/3 = 10,000), then we would multiply it by the new quantity (10,000 * 2 = 20,000)

                let totalAmount = 0;
                user.cart.cartProducts.forEach((product) => {
                    if (product.productId === itemSelected.productId) {
                        product.subTotal = (itemSelected.subTotal / itemSelected.quantity) * (itemSelected.quantity - req.body.quantity);

                        /*  itemSelected.addOns.forEach((addOn) => {
                             itemSelected.subTotal = ((itemSelected.subTotal / itemSelected.quantity) * (itemSelected.quantity - req.body.quantity)) - addOn.price;
                         }) */

                        product.quantity = product.quantity - req.body.quantity;

                    }

                    totalAmount = totalAmount + product.subTotal
                })

                user.cart.totalAmount = totalAmount;

            } else {
                //if the user inputted quantity is greater than the current quantity
                console.log(`Please enter a quantity less than or equal to ${itemSelected.quantity}`);
                return res.send(false);
            }

            await user.save().then(() => {
                return res.send(true);
            })

        } else {
            return res.send(false)
        }

    } catch (error) {
        console.log(error.message)
        return res.send(false)
    }
}

//clear cart
module.exports.clearCart = async (req, res) => {
    if (req.user.isAdmin) {
        console.log("Action forbidden.")
        return res.send(false)
    }
    try {
        const user = await User.findById(req.user.id, { cart: 1 })
        user.cart.cartProducts = []
        user.cart.totalAmount = 0;

        await user.save().then(() => res.send(true));


    } catch (error) {
        console.log(error.message)
        return res.send(false)
    }
}

// add order/checkout product
module.exports.checkout = async (req, res) => {

    if (req.user.isAdmin) {
        console.log("You do not have permission to perform this action.")
        return res.send(false)
    }

    try {
        //this is where req body is stored
        let userProductsInputArray = req.body.products;

        const user = await User.findById(req.user.id);
        /*  if (user.cart.cartProducts.length > 0) {
             //if the user has a existing cart of products, reassign the userProductsInputArray to the cartProducts array from the user model
             //we will no longer need the req body in the /checkout route if the cart is not empty
             //if the cart is initially empty, the req body is required in the /checkout route
             userProductsInputArray = user.cart.cartProducts
         } */

        //create an array of product ids from the user input
        let userCartProductsID = userProductsInputArray.map((product) => {
            return product.productId
        })

        //get all the active products  where it's product id is equal to the user input product id(s)
        const product = await Product.find({ isActive: true, _id: { $in: userCartProductsID } });
        //initialize total amount
        let totalAmount = 0;
        //let stocks = 0;

        //create a Map object for better performance
        const productMap = new Map();
        const productNameMap = new Map();

        // set up product map with ID as key to easily retrieve price
        product.forEach(obj => {
            productMap.set(obj._id.toString(), obj.price);
            productNameMap.set(obj._id.toString(), obj.name)
            //quantityMap.set(obj._id.toString(), obj.stocks);

        });

        //loop thru the product query to get the stocks
        for (let i = 0; i < product.length; i++) {
            //for every product iteration, substract the quantity from user input into the stocks property of the product
            product[i].stocks = product[i].stocks - userProductsInputArray[i].quantity;
            if (product[i].stocks < 0) {
                console.log(`insufficient stocks for ${product[i].name}`)
                return res.send(false)
            }
            //update stocks after  user checkout
            await Product.updateMany({ _id: product[i]._id, stocks: { $gt: 0 } }, { $set: { stocks: product[i].stocks } })
        }

        //create a new Order document
        let newOrder = new Order({
            customerName: `${user.firstName} ${user.lastName}`,
            customerEmail:user.email,
            userId: req.user.id,
            totalAmount: totalAmount
        })

        // create a new array of objects for every user input products
        let productsArray = userProductsInputArray.map((product) => {
            //this returns an object
            return {
                productName: productNameMap.get(product.productId),
                productId: product.productId,
                quantity: product.quantity,
                addOns: product.addOns,
                subTotal: productMap.get(product.productId) * product.quantity
            }

        });

        // loop through each products that the user ordered via req body
        userProductsInputArray.forEach((product) => {
            totalAmount += productMap.get(product.productId) * product.quantity;
            /* stocks = quantityMap.get(product.id) - product.quantity;
            if (stocks < 0) {
                console.log(`insufficient stocks for this item`);
                return res.send(false);
            } else {
                await Product.updateMany({ _id: product.id, stocks: { $gt: 0 } }, { $set: { stocks: stocks } })
            } */
            if (product.addOns.length > 0) {

                product.addOns.forEach((addOn) => {
                    totalAmount += addOn.price
                })


            }

        });

        newOrder.totalAmount = totalAmount;
        //insert the objects into the Order models products property array
        newOrder.products.push(...productsArray);

        newOrder.products.forEach((order) => {
            if (order.addOns.length > 0) {
                order.addOns.forEach((addOn) => {
                    order.subTotal += addOn.price
                })
            }
        })


        await newOrder.save().then((data) => {
            return res.send(true)
        });

        /* return order.save().then(() => {
            //if the user has an existing cart
            if (user.cart.cartProducts.length > 0) {
                //clear the cart after checking out
                user.cart.cartProducts = []
                user.cart.totalAmount = 0;
                //save the user document
                return user.save().then(res.send(true));
            } else {
                //if the cart is initially empty,do the normal checkout behaviour
                return res.send(true)
            }

        }) */

    } catch (error) {
        res.send(false)
    }
}

// add order/checkout product
module.exports.prescriptionCheckout = async (req, res) => {

    if (req.user.isAdmin) {
        console.log("You do not have permission to perform this action.")
        return res.send(false)
    }

    try {
        //this is where req body is stored
        let userProductsInputArray = req.body.products;

        const user = await User.findById(req.user.id);
        /*  if (user.cart.cartProducts.length > 0) {
             //if the user has a existing cart of products, reassign the userProductsInputArray to the cartProducts array from the user model
             //we will no longer need the req body in the /checkout route if the cart is not empty
             //if the cart is initially empty, the req body is required in the /checkout route
             userProductsInputArray = user.cart.cartProducts
         } */

        //create an array of product ids from the user input
        let userCartProductsID = userProductsInputArray.map((product) => {
            return product.productId
        })

        //get all the active products  where it's product id is equal to the user input product id(s)
        const product = await Product.find({ isActive: true, _id: { $in: userCartProductsID } });
        //initialize total amount
        let totalAmount = 0;
        //let stocks = 0;

        //create a Map object for better performance
        const productMap = new Map();
        const productNameMap = new Map();

        // set up product map with ID as key to easily retrieve price
        product.forEach(obj => {
            productMap.set(obj._id.toString(), obj.price);
            productNameMap.set(obj._id.toString(), obj.name)
            //quantityMap.set(obj._id.toString(), obj.stocks);

        });

        //loop thru the product query to get the stocks
        for (let i = 0; i < product.length; i++) {
            //for every product iteration, substract the quantity from user input into the stocks property of the product
            product[i].stocks = product[i].stocks - userProductsInputArray[i].quantity;
            if (product[i].stocks < 0) {
                console.log(`insufficient stocks for ${product[i].name}`)
                return res.send(false)
            }
            //update stocks after  user checkout
            await Product.updateMany({ _id: product[i]._id, stocks: { $gt: 0 } }, { $set: { stocks: product[i].stocks } })
        }

        //create a new Order document
        let newOrder = new Order({
            customerName: `${user.firstName} ${user.lastName}`,
            customerEmail:user.email,
            userId: req.user.id,
            totalAmount: totalAmount
        })

        // create a new array of objects for every user input products
        let productsArray = userProductsInputArray.map((product) => {
            //this returns an object
            if (product.prescription.visionType === 'Non Prescription') {
                return {
                    productName: productNameMap.get(product.productId),
                    productId: product.productId,
                    quantity: product.quantity,
                    addOns: product.addOns,
                    subTotal: (productMap.get(product.productId) * product.quantity) + product.prescription.lensUpgrade.lensPrice,
                    isPrescription: product.isPrescription,
                    prescription: {
                        visionType: product.prescription.visionType,
                        lensUpgrade: {
                            lensType: product.prescription.lensUpgrade.lensType,
                            lensPrice: product.prescription.lensUpgrade.lensPrice
                        }

                    }
                }

            } else {
                return {
                    productName: productNameMap.get(product.productId),
                    productId: product.productId,
                    quantity: product.quantity,
                    addOns: product.addOns,
                    subTotal: (productMap.get(product.productId) * product.quantity) + product.prescription.lensUpgrade.lensPrice,
                    isPrescription: product.isPrescription,
                    prescription: {
                        visionType: product.prescription.visionType,
                        lensUpgrade: {
                            lensType: product.prescription.lensUpgrade.lensType,
                            lensPrice: product.prescription.lensUpgrade.lensPrice
                        },
                        odRightEye: {
                            SPH: product.prescription.odRightEye.SPH,
                            CYL: product.prescription.odRightEye.CYL,
                            AXIS: product.prescription.odRightEye.AXIS,
                            ADD: product.prescription.odRightEye.ADD,
                            IPD: product.prescription.odRightEye.IPD
                        },
                        odLeftEye: {
                            SPH: product.prescription.odLeftEye.SPH,
                            CYL: product.prescription.odLeftEye.CYL,
                            AXIS: product.prescription.odLeftEye.AXIS,
                            ADD: product.prescription.odLeftEye.ADD,
                            IPD: product.prescription.odLeftEye.IPD
                        }

                    }
                }

            }


        });

        // loop through each products that the user ordered via req body
        userProductsInputArray.forEach((product) => {
            totalAmount += (productMap.get(product.productId) * product.quantity) + product.prescription.lensUpgrade.lensPrice;
            /* stocks = quantityMap.get(product.id) - product.quantity;
            if (stocks < 0) {
                console.log(`insufficient stocks for this item`);
                return res.send(false);
            } else {
                await Product.updateMany({ _id: product.id, stocks: { $gt: 0 } }, { $set: { stocks: stocks } })
            } */
            if (product.addOns.length > 0) {

                product.addOns.forEach((addOn) => {
                    totalAmount += addOn.price
                })


            }

        });

        newOrder.totalAmount = totalAmount;
        //insert the objects into the Order models products property array
        newOrder.products.push(...productsArray);

        newOrder.products.forEach((order) => {
            if (order.addOns.length > 0) {
                order.addOns.forEach((addOn) => {
                    order.subTotal += addOn.price
                })
            }
        })


        await newOrder.save().then((data) => {
            return res.send(true)
        });

        /* return order.save().then(() => {
            //if the user has an existing cart
            if (user.cart.cartProducts.length > 0) {
                //clear the cart after checking out
                user.cart.cartProducts = []
                user.cart.totalAmount = 0;
                //save the user document
                return user.save().then(res.send(true));
            } else {
                //if the cart is initially empty,do the normal checkout behaviour
                return res.send(true)
            }

        }) */

    } catch (error) {
        res.send(false)
    }
}

// checkout for cart products
module.exports.cartCheckout = async (req, res) => {

    if (req.user.isAdmin) {
        console.log("You do not have permission to perform this action.")
        return res.send(false)
    }

    try {

        const user = await User.findById(req.user.id);

        let userProductsInputArray = user.cart.cartProducts;

        //create an array of product ids from the user input
        let userCartProductsID = userProductsInputArray.map((product) => {
            return product.productId
        })

        //get all the active products  where it's product id is equal to the user input product id(s)
        const product = await Product.find({ isActive: true, _id: { $in: userCartProductsID } });
        //initialize total amount
        let totalAmount = 0;
        //let stocks = 0;

        //create a Map object for better performance
        const productMap = new Map();
        const productNameMap = new Map();

        // set up product map with ID as key to easily retrieve price
        product.forEach(obj => {
            productMap.set(obj._id.toString(), obj.price);
            productNameMap.set(obj._id.toString(), obj.name)
            //quantityMap.set(obj._id.toString(), obj.stocks);

        });


        //loop thru the product query to get the stocks
        for (let i = 0; i < product.length; i++) {
            //for every product iteration, substract the quantity from user input into the stocks property of the product
            product[i].stocks = product[i].stocks - userProductsInputArray[i].quantity;
            if (product[i].stocks < 0) {
                console.log(`insufficient stocks for ${product[i].name}`)
                return res.send(false)
            }
            //update stocks after  user checkout
            await Product.updateMany({ _id: product[i]._id, stocks: { $gt: 0 } }, { $set: { stocks: product[i].stocks } })
        }

        //create a new Order document
        let newOrder = new Order({
            customerName: `${user.firstName} ${user.lastName}`,
            customerEmail:user.email,
            userId: req.user.id,
            totalAmount: totalAmount
        })

        // create a new array of objects for every user input products
        let productsArray = userProductsInputArray.map((product) => {
            //this returns an object
            return {
                productName: productNameMap.get(product.productId),
                productId: product.productId,
                quantity: product.quantity,
                addOns: product.addOns,
                subTotal: productMap.get(product.productId) * product.quantity
            }
        })

        // loop through each products that the user ordered via req body
        userProductsInputArray.forEach((product) => {
            totalAmount += productMap.get(product.productId) * product.quantity;

            if (product.addOns.length > 0) {

                product.addOns.forEach((addOn) => {
                    totalAmount += addOn.price
                })

            }
        });

        //const order = await newOrder.save();

        newOrder.totalAmount = totalAmount;

        //insert the objects into the Order models products property array
        newOrder.products.push(...productsArray);

        newOrder.products.forEach((order) => {
            if (order.addOns.length > 0) {
                order.addOns.forEach((addOn) => {
                    order.subTotal += addOn.price
                })
            }
        })

        await newOrder.save().then(() => {
            //if the user has an existing cart
            user.cart.cartProducts = []
            user.cart.totalAmount = 0;
            //save the user document
            return user.save().then(res.send(true));

        })

    } catch (error) {
        res.send(false)
    }
}

//get user cart
module.exports.getUserCart = async (req, res) => {
    if (req.user.isAdmin) {
        console.log("Action forbidden.")
        return res.send(false)
    }
    try {
        const user = await User.findById(req.user.id, { cart: 1 })
        if (user.cart.cartProducts.length > 0) {
            return res.send(user);
        } else {
            console.log("User Cart is Empty.")
            return res.send(false)
        }

    } catch (error) {
        return res.send(false)
    }
}



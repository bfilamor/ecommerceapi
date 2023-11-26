const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
require('dotenv').config()

const cors = require("cors");

//Import routes
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const orderRoutes =  require("./routes/order")
const productAddOnRoutes = require("./routes/productAddOn");
const doctorRoutes = require("./routes/doctor");
const appointmentRoutes = require("./routes/appointment");

//Servers setup
const app = express();
const port = 4000;
//const port = 4006;

//Middlewares
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

//db connection
/* local db connection url
mongodb://localhost:27017/dbName
*/
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => console.log("We're connected to the cloud database"));

// Backend routes
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/addons", productAddOnRoutes);
app.use("/orders", orderRoutes);
app.use("/doctors", doctorRoutes);
app.use("/appointments", appointmentRoutes);
/* app.use("/b6/users", userRoutes);
app.use("/b6/products", productRoutes);
app.use("/b6/addons", productAddOnRoutes);
app.use("/b6/orders", orderRoutes); */



//Server Start
if(require.main === module) {
    app.listen(port, () => console.log(`Server running at port ${port}`));
}

module.exports = app;

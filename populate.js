require("dotenv").config();

const connectDB = require("./db/connect");
const Product = require("./models/Product");
const productsList = require("./mockData/products.json");

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("Connected to DB...");
    await Product.deleteMany();
    await Product.create(productsList);
    console.log("Success!!!");
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();

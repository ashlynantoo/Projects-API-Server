const { StatusCodes } = require("http-status-codes");
const Product = require("../models/Product");
const CustomError = require("../errors");

const getAllProducts = async (req, res) => {
  const queryObject = {};

  const { name, category, company, sort, price, featured, freeShipping } =
    req.query;

  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }

  if (category && category !== "all") {
    queryObject.category = category;
  }

  if (company && company !== "all") {
    queryObject.company = company;
  }

  if (price) {
    queryObject.price = { $lte: price };
  }

  if (featured) {
    queryObject.featured = featured;
  }

  if (freeShipping) {
    queryObject.freeShipping = true;
  }

  let result = Product.find(queryObject).select(
    "_id name price description images category company colors featured freeShipping"
  );

  if (sort) {
    if (sort === "price-low") {
      result = result.sort("price");
    } else if (sort === "price-high") {
      result = result.sort("-price");
    } else if (sort === "a-z") {
      result = result.sort("name");
    } else if (sort === "z-a") {
      result = result.sort("-name");
    }
  } else {
    result = result.sort("name");
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 15;
  const skip = (page - 1) * limit;
  result = result.limit(limit).skip(skip);

  if (featured) {
    result = result.limit(3);
  }

  const products = await result;

  const productsList = products.map((product) => {
    const {
      _id: id,
      name,
      price,
      description,
      images,
      category,
      company,
      colors,
      featured,
      freeShipping,
    } = product;

    const image = images[0].url;

    return {
      id,
      name,
      price,
      description,
      image,
      category,
      company,
      colors,
      featured,
      freeShipping,
    };
  });

  const categories = [
    "all",
    ...new Set(
      productsList.map((product) => {
        return product.category;
      })
    ),
  ];

  const companies = [
    "all",
    ...new Set(
      productsList.map((product) => {
        return product.company;
      })
    ),
  ];

  const numOfProducts = await Product.find(queryObject).countDocuments();
  const pageCount = Math.ceil(numOfProducts / limit);

  res.status(StatusCodes.OK).json({
    products: productsList,
    meta: {
      pagination: { page, pageSize: limit, pageCount, total: numOfProducts },
      categories,
      companies,
    },
  });
};

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findById(productId).select(
    "_id name price description images company colors inventory averageRating numOfReviews"
  );

  if (!product) {
    throw new CustomError.NotFoundError(`No product with Id ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

module.exports = {
  getAllProducts,
  getSingleProduct,
};

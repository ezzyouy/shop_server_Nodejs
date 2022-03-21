const express = require("express");
const { default: mongoose } = require("mongoose");
const multer = require("multer");
const Category = require("../models/category");
const Product = require("../models/product");
const router = express.Router();

const File_TYPE_MAP = {
  "image/png": "png",
  "image/jpng": "jpng",
  "image/jpg": "jpg",
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValidFile = File_TYPE_MAP[file.mimetype];
    let upLoadError = new Error("invalid image type");
    if (isValidFile) {
      upLoadError = null;
    }
    cb(upLoadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-"); //split(' ').join('-')=replace(' ','-')
    const extension = File_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

router.get("/", async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(".") };
  }
  const productList = await Product.find(filter).populate("category");
  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.json(productList);
});
router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");
  if (!product) {
    res.status(500).json({ success: false });
  }
  res.json(product);
});

router.post("/", uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const file = req.file;
  if (!file) return res.status(400).send("No image in the request ");

  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });
  createdProduct = await product.save();

  if (!createdProduct) {
    res.status(500).json({
      message: "the product cannot be created",
      success: false,
    });
  }
  res.status(201).json(createdProduct);
});
router.put("/:id", uploadOptions.single("image"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(500).send("Invalid product ID");
  }

  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(400).send("Invalid Product");

  const file = req.file;
  let imagePath;
  if (file) {
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    imagePath = `${basePath}${fileName}`;
  } else {
    imagePath = product.image;
  }

  const productUpdated = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );

  if (!productUpdated) {
    res.status(500).json({
      message: "the product cannot be updated",
      success: false,
    });
  }
  res.status(200).json(productUpdated);
});
router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  Product.findByIdAndRemove(id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "the product is deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "the product not found" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});
router.get(`/get/count`, async (req, res) => {
  const countProduct = await Product.countDocuments();
  if (!countProduct) {
    res.status(500).json({ success: false });
  }
  res.send({
    countProduct: countProduct,
  });
});
router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const product = await Product.find({ isFeatured: true }).limit(+count);
  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});
router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 5),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(500).send("Invalid product ID");
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    if (files) {
      files.map((file) => {
        imagesPaths.push(`${basePath}${file.filename}`);
      });
    }
    const productUpdated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      { new: true }
    );

    if (!productUpdated) {
      res.status(500).json({
        message: "the product cannot be updated",
        success: false,
      });
    }
    res.status(200).json(productUpdated);
  }
);
module.exports = router;

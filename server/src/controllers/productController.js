const Product = require("../models/Product");

const getProducts = async (_req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
};

const createProduct = async (req, res) => {
  const created = await Product.create(req.body);
  res.status(201).json(created);
};

const updateProduct = async (req, res) => {
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    return res.status(404).json({ message: "Product not found." });
  }

  res.json(updated);
};

const deleteProduct = async (req, res) => {
  const removed = await Product.findByIdAndDelete(req.params.id);
  if (!removed) {
    return res.status(404).json({ message: "Product not found." });
  }
  res.json({ message: "Product removed." });
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };

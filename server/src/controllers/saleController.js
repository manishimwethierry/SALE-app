const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

const getSales = async (_req, res) => {
  const sales = await Sale.find()
    .populate("customer", "name")
    .populate("product", "name sku")
    .sort({ soldAt: -1 });
  res.json(sales);
};

const createSale = async (req, res) => {
  const { customer, product, quantity } = req.body;

  const [foundCustomer, foundProduct] = await Promise.all([
    Customer.findById(customer),
    Product.findById(product),
  ]);

  if (!foundCustomer) {
    return res.status(400).json({ message: "Customer is invalid." });
  }
  if (!foundProduct) {
    return res.status(400).json({ message: "Product is invalid." });
  }
  if (quantity < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1." });
  }
  if (foundProduct.quantity < quantity) {
    return res.status(400).json({ message: "Not enough stock available." });
  }

  foundProduct.quantity -= quantity;
  await foundProduct.save();

  const unitPrice = foundProduct.price;
  const total = unitPrice * quantity;

  const sale = await Sale.create({
    customer,
    product,
    quantity,
    unitPrice,
    total,
  });

  const populated = await sale.populate([
    { path: "customer", select: "name" },
    { path: "product", select: "name sku" },
  ]);

  res.status(201).json(populated);
};

module.exports = { getSales, createSale };

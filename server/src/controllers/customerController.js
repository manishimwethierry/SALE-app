const Customer = require("../models/Customer");

const getCustomers = async (_req, res) => {
  const customers = await Customer.find().sort({ createdAt: -1 });
  res.json(customers);
};

const createCustomer = async (req, res) => {
  const created = await Customer.create(req.body);
  res.status(201).json(created);
};

const updateCustomer = async (req, res) => {
  const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    return res.status(404).json({ message: "Customer not found." });
  }

  res.json(updated);
};

const deleteCustomer = async (req, res) => {
  const removed = await Customer.findByIdAndDelete(req.params.id);
  if (!removed) {
    return res.status(404).json({ message: "Customer not found." });
  }
  res.json({ message: "Customer removed." });
};

module.exports = { getCustomers, createCustomer, updateCustomer, deleteCustomer };

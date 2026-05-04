const errorHandler = (error, _req, res, _next) => {
  console.error(error);

  if (error.code === 11000) {
    return res.status(400).json({ message: "Duplicate value found." });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({ message: error.message });
  }

  res.status(500).json({ message: "Server error." });
};

module.exports = errorHandler;

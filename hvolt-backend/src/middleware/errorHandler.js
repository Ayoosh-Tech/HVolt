// Centralized error handler. Any `next(err)` call in a route lands here.
function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "Validation failed.", details: err.errors });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: "A record with that value already exists." });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Something went wrong on our end.",
  });
}

module.exports = { notFound, errorHandler };

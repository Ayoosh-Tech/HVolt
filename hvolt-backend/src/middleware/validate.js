const { validationResult } = require("express-validator");

// Drop-in middleware: place after express-validator's `body(...)` checks on
// any route. Short-circuits with a 400 if validation failed, otherwise
// passes through to the controller.
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Validation failed.", errors: errors.array() });
  }
  next();
}

module.exports = { handleValidation };

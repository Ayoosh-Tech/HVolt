const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const { handleValidation } = require("../middleware/validate");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many attempts. Please try again later." },
});

router.post(
  "/register",
  authLimiter,
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().withMessage("Enter a valid email."),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
  ],
  handleValidation,
  authController.register
);

router.post(
  "/login",
  authLimiter,
  [body("email").isEmail(), body("password").notEmpty()],
  handleValidation,
  authController.login
);

router.post(
  "/forgot-password",
  authLimiter,
  [body("email").isEmail()],
  handleValidation,
  authController.forgotPassword
);

router.post(
  "/reset-password",
  authLimiter,
  [body("token").notEmpty(), body("password").isLength({ min: 8 })],
  handleValidation,
  authController.resetPassword
);

router.get("/me", requireAuth, authController.me);

module.exports = router;

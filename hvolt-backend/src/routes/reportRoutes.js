const express = require("express");
const { body } = require("express-validator");
const reportController = require("../controllers/reportController");
const { requireAuth } = require("../middleware/auth");
const { handleValidation } = require("../middleware/validate");

const router = express.Router();

router.get("/", reportController.list);

router.post(
  "/",
  requireAuth,
  [
    body("type").isIn(["outage", "restoration"]),
    body("neighborhood").isMongoId(),
    body("lat").isFloat({ min: -90, max: 90 }),
    body("lng").isFloat({ min: -180, max: 180 }),
    body("comment").optional().isLength({ max: 500 }),
  ],
  handleValidation,
  reportController.create
);

router.post("/:id/confirm", requireAuth, reportController.confirm);

router.post(
  "/:id/flag",
  requireAuth,
  [body("reason").optional().isLength({ max: 300 })],
  handleValidation,
  reportController.flag
);

module.exports = router;

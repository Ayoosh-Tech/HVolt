const express = require("express");
const neighborhoodController = require("../controllers/neighborhoodController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", neighborhoodController.list);
router.get("/:id", neighborhoodController.getById);
router.post("/", requireAuth, requireAdmin, neighborhoodController.create);
router.patch("/:id", requireAuth, requireAdmin, neighborhoodController.update);

module.exports = router;

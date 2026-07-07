const express = require("express");
const adminController = require("../controllers/adminController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/reports", adminController.listReports);
router.patch("/reports/:id", adminController.updateReportStatus);
router.delete("/reports/:id", adminController.removeReport);

router.get("/users", adminController.listUsers);
router.patch("/users/:id", adminController.updateUser);

router.get("/analytics", adminController.analytics);

module.exports = router;

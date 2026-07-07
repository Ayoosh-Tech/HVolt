const express = require("express");
const userController = require("../controllers/userController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/me", requireAuth, userController.getMe);
router.patch("/me", requireAuth, userController.updateMe);
router.post("/me/follow/:neighborhoodId", requireAuth, userController.followNeighborhood);
router.delete("/me/follow/:neighborhoodId", requireAuth, userController.unfollowNeighborhood);

module.exports = router;

const User = require("../models/User");

async function getMe(req, res) {
  res.json({ user: req.user.toSafeJSON() });
}

async function updateMe(req, res, next) {
  try {
    const { name, preferredLanguage } = req.body;
    if (name) req.user.name = name;
    if (preferredLanguage) req.user.preferredLanguage = preferredLanguage;
    await req.user.save();
    res.json({ user: req.user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

async function followNeighborhood(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { followedNeighborhoods: req.params.neighborhoodId },
    });
    res.json({ message: "Now following this neighborhood." });
  } catch (err) {
    next(err);
  }
}

async function unfollowNeighborhood(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { followedNeighborhoods: req.params.neighborhoodId },
    });
    res.json({ message: "Unfollowed." });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe, followNeighborhood, unfollowNeighborhood };

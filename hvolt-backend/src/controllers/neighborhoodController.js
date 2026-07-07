const Neighborhood = require("../models/Neighborhood");

async function list(req, res, next) {
  try {
    const { state, lga, q, near, radiusKm = 25 } = req.query;
    const filter = {};
    if (state) filter.state = state;
    if (lga) filter.lga = lga;
    if (q) filter.$text = { $search: q };

    if (near) {
      const [lng, lat] = near.split(",").map(Number);
      filter.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: Number(radiusKm) * 1000,
        },
      };
    }

    const neighborhoods = await Neighborhood.find(filter).limit(500);
    res.json({ neighborhoods });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const neighborhood = await Neighborhood.findById(req.params.id);
    if (!neighborhood) return res.status(404).json({ message: "Neighborhood not found." });
    res.json({ neighborhood });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, state, lga, lat, lng } = req.body;
    const neighborhood = await Neighborhood.create({
      name,
      state,
      lga,
      location: { type: "Point", coordinates: [lng, lat] },
    });
    res.status(201).json({ neighborhood });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const updates = (({ name, state, lga }) => ({ name, state, lga }))(req.body);
    Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

    if (req.body.lightScoreOverride !== undefined) {
      updates["lightScore.value"] = req.body.lightScoreOverride;
    }

    const neighborhood = await Neighborhood.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!neighborhood) return res.status(404).json({ message: "Neighborhood not found." });
    res.json({ neighborhood });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update };

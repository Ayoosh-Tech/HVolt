// Seeds a handful of Nigerian neighborhoods and an admin user for local development.
// Run with: npm run seed
require("dotenv").config();
const connectDB = require("../config/db");
const Neighborhood = require("../models/Neighborhood");
const User = require("../models/User");

const NEIGHBORHOODS = [
  { name: "Wuse II", state: "FCT", lga: "AMAC", lat: 9.0836, lng: 7.4761 },
  { name: "Garki", state: "FCT", lga: "AMAC", lat: 9.0345, lng: 7.4863 },
  { name: "Maitama", state: "FCT", lga: "AMAC", lat: 9.0938, lng: 7.4951 },
  { name: "Gwarinpa", state: "FCT", lga: "Bwari", lat: 9.1096, lng: 7.4188 },
  { name: "Ikeja GRA", state: "Lagos", lga: "Ikeja", lat: 6.5833, lng: 3.35 },
  { name: "Lekki Phase 1", state: "Lagos", lga: "Eti-Osa", lat: 6.4698, lng: 3.5852 },
  { name: "Surulere", state: "Lagos", lga: "Surulere", lat: 6.5059, lng: 3.3548 },
  { name: "Kano City", state: "Kano", lga: "Kano Municipal", lat: 12.0022, lng: 8.592 },
  { name: "Sabon Gari", state: "Kano", lga: "Fagge", lat: 12.0142, lng: 8.5313 },
  { name: "Dala", state: "Kano", lga: "Dala", lat: 12.0028, lng: 8.5058 },
  { name: "Gyadi-Gyadi", state: "Kano", lga: "Tarauni", lat: 11.9695, lng: 8.5228 },
  { name: "Gwale", state: "Kano", lga: "Gwale", lat: 11.9980, lng: 8.4855},
  { name: "Hotoro", state: "Kano", lga: "Gwale", lat: 11.9952, lng: 8.5534},
  { name: "Ungogo", state: "Kano" , lga: "Ungogo", lat: 12.0786, lng: 8.4898 },
  { name: "Rijiyar", state: "Kano", lga: "Ungogo", lat: 11.993900, lng: 8.431300}, 
  { name: "GRA Port Harcourt", state: "Rivers", lga: "Port Harcourt", lat: 4.8156, lng: 7.0498 },
];

async function seed() {
  await connectDB();

  await Neighborhood.deleteMany({});
  await Neighborhood.insertMany(
    NEIGHBORHOODS.map((n) => ({
      name: n.name,
      state: n.state,
      lga: n.lga,
      location: { type: "Point", coordinates: [n.lng, n.lat] },
    }))
  );
  console.log(`[seed] Inserted ${NEIGHBORHOODS.length} neighborhoods.`);

  const adminEmail = "admin@hvolt.ng";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = new User({ name: "HVolt Admin", email: adminEmail, role: "admin" });
    await admin.setPassword("ChangeMe123!");
    await admin.save();
    console.log(`[seed] Created admin user: ${adminEmail} / ChangeMe123! (change this immediately)`);
  }

  console.log("[seed] Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

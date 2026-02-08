const express = require("express");
const router = express.Router();
const {protect ,restrictTo } = require('../middleware/authMiddleware');

const {
  createChargingStation,
  getNearbyChargingStations,
} = require("../controllers/chargingStationController");

const {
  nearbyStationsValidator,
  createChargingStationValidator,
} = require("../utils/validation/chargeStationValidate");



// =======================
// Admin
// =======================
router.post(
  "/",
  protect,
  restrictTo("admin"),
  createChargingStationValidator,
  createChargingStation
)

// =======================
// User
// =======================
router.get(
  "/nearby",
  nearbyStationsValidator,
  getNearbyChargingStations
);

module.exports = router;
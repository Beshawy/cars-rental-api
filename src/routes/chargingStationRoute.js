const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');

const {
  createChargingStation,
  getNearbyChargingStations,
} = require("../controllers/chargingStationController");

const {
  nearbyStationsValidator,
  createChargingStationValidator,
} = require("../utils/validation/chargeStationValidate");



/**
 * @swagger
 * /api/v1/charging-station:
 *   post:
 *     summary: Create a new charging station (Admin only)
 *     tags: [Charging Stations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, location, status]
 *             properties:
 *               name: { type: string }
 *               location: 
 *                 type: object
 *                 properties:
 *                   type: { type: string, example: 'Point' }
 *                   coordinates: { type: array, items: { type: number }, example: [31.235, 30.044] }
 *               status: { type: string, enum: [active, maintenance, inactive] }
 *     responses:
 *       201:
 *         description: Charging station created
 */
router.post(
  "/",
  protect,
  restrictTo("admin"),
  createChargingStationValidator,
  createChargingStation
)

/**
 * @swagger
 * /api/v1/charging-station/nearby:
 *   get:
 *     summary: Get nearby charging stations
 *     tags: [Charging Stations]
 *     parameters:
 *       - in: query
 *         name: lng
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: lat
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: distance
 *         schema: { type: number, default: 10000 }
 *         description: Max distance in meters
 *     responses:
 *       200:
 *         description: List of nearby stations
 */
router.get(
  "/nearby",
  nearbyStationsValidator,
  getNearbyChargingStations
);

module.exports = router;
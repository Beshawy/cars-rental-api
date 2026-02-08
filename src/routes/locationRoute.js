const express = require('express');
const locationController = require('../controllers/locationController');
const { updateLocationValidation, getNearbyValidation } = require('../utils/validation/laocationValidators');
const { validate, validateQuery } = require('../middleware/validatorMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/v1/location/nearby:
 *   get:
 *     summary: Get nearby service locations
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: lng
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: lat
 *         required: true
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: Nearby locations
 */
router.get('/nearby', validateQuery(getNearbyValidation), locationController.getNearbyLocations);

/**
 * @swagger
 * /api/v1/location/distance:
 *   get:
 *     summary: Calculate distance between two points
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: startLng
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: startLat
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: endLng
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: endLat
 *         required: true
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: Distance in KM
 */
router.get('/distance', locationController.calculateDistance);

/**
 * @swagger
 * /api/v1/location:
 *   post:
 *     summary: Update location
 *     tags: [Locations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lng: { type: number }
 *               lat: { type: number }
 *     responses:
 *       200:
 *         description: Location updated
 */
router.post('/', validate(updateLocationValidation), locationController.updateLocation);

module.exports = router;

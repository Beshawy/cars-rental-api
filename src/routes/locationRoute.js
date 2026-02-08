const express = require('express');
const locationController = require('../controllers/locationController');
const { updateLocationValidation, getNearbyValidation } = require('../utils/validation/laocationValidators');
const { validate, validateQuery } = require('../middleware/validatorMiddleware');

const router = express.Router();

// Public routes
router.get('/nearby', validateQuery(getNearbyValidation), locationController.getNearbyLocations);
router.get('/distance', locationController.calculateDistance);

router.post('/', validate(updateLocationValidation), locationController.updateLocation);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { createCar, updateCar, deleteCar, getAllCars, getCarById, getCarByName, searchCars } = require('../controllers/carControl');
const { uploadCarImage } = require('../controllers/carControl');
const { upload } = require('../utils/uploadImage');


/**
 * @swagger
 * /api/v1/car:
 *   get:
 *     summary: Get all cars
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all cars
 *   post:
 *     summary: Create a new car (Admin only)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brand: { type: string }
 *               model: { type: string }
 *               year: { type: number }
 *               pricePerDay: { type: number }
 *     responses:
 *       201:
 *         description: Car created successfully
 */
router.route('/')
    .get(protect, getAllCars)
    .post(protect, restrictTo('admin'), createCar);

/**
 * @swagger
 * /api/v1/car/search:
 *   get:
 *     summary: Search cars by query
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search query for brand or model
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', protect, searchCars);

/**
 * @swagger
 * /api/v1/car/{id}:
 *   get:
 *     summary: Get car by ID
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Car details
 *   put:
 *     summary: Update car (Admin only)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Car updated successfully
 *   delete:
 *     summary: Delete car (Admin only)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Car deleted
 */
router.route('/:id')
    .get(protect, getCarById)
    .put(protect, restrictTo('admin'), updateCar)
    .delete(protect, restrictTo('admin'), deleteCar);

/**
 * @swagger
 * /api/v1/car/upload-image/{id}:
 *   put:
 *     summary: Upload car image (Admin only)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 */
router.put('/upload-image/:id', protect, restrictTo('admin'), upload.single('image'), uploadCarImage);


module.exports = router;


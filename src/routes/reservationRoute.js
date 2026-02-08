const express = require("express");
const router = express.Router();
const { createReservation, getUserReservations, getAllReservations, deleteReservation } = require("../controllers/reservationController");
const { createReservationSchema } = require("../utils/validation/reservationValidation");
const { validate } = require("../middleware/validatorMiddleware");
const { protect, restrictTo } = require("../middleware/authMiddleware");

/**
 * @swagger
 * /api/v1/reservation/reserve:
 *   post:
 *     summary: Create a new reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [car, startDate, endDate]
 *             properties:
 *               car: { type: string }
 *               startDate: { type: string, format: date-time }
 *               endDate: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Reservation created successfully
 */
router.post(
    "/reserve",
    protect,
    validate(createReservationSchema),
    createReservation
);

/**
 * @swagger
 * /api/v1/reservation/{userId}:
 *   get:
 *     summary: Get reservations for a specific user
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of user reservations
 */
router.get(
    "/:userId",
    protect,
    getUserReservations
);

/**
 * @swagger
 * /api/v1/reservation:
 *   get:
 *     summary: Get all reservations (Admin only)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all reservations
 */
router.get(
    "/",
    protect,
    restrictTo('admin'),
    getAllReservations
);

/**
 * @swagger
 * /api/v1/reservation/{id}:
 *   delete:
 *     summary: Cancel/Delete a reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Reservation deleted
 */
router.delete(
    "/:id",
    protect,
    deleteReservation
);

module.exports = router;
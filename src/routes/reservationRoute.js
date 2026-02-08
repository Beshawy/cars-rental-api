const express = require("express");
const router = express.Router();
const { createReservation, getUserReservations, getAllReservations, deleteReservation } = require("../controllers/reservationController");
const { createReservationSchema } = require("../utils/validation/reservationValidation");
const { validate } = require("../middleware/validatorMiddleware");
const {protect , restrictTo} = require("../middleware/authMiddleware");

router.post(
    "/reserve",
    protect,
    validate(createReservationSchema),
    createReservation
);

router.get(
    "/:userId",
    protect,
    getUserReservations
);

router.get(
    "/",
    protect,
    restrictTo('admin'),
    getAllReservations
);

router.delete(
    "/:id",
    protect,
    deleteReservation
);

module.exports = router;
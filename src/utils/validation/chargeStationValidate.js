const { body, query } = require("express-validator");

exports.createChargingStationValidator = [
  body("name")
    .notEmpty()
    .withMessage("Station name is required"),

  body("pricePerKwh")
    .isFloat({ min: 0 })
    .withMessage("Price per Kwh must be a positive number"),

  body("chargingType")
    .isIn(["slow", "fast", "super"])
    .withMessage("Invalid charging type"),

  body("location.latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),

  body("location.longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),
];

exports.nearbyStationsValidator = [
  query("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),

  query("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),

  query("distance")
    .optional()
    .isInt({ min: 100 })
    .withMessage("Distance must be in meters"),
];
const mongoose = require("mongoose");

const chargingStationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    chargingType: {
      type: String,
      enum: ["slow", "fast", "super"],
      required: true,
    },

    pricePerKwh: {
      type: Number,
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    city: String,
    address: String,
  },
  { timestamps: true }
);

// 🔥 مهم جدًا
chargingStationSchema.index({ location: "2dsphere" });

module.exports = mongoose.model(
  "ChargingStation",
  chargingStationSchema
);

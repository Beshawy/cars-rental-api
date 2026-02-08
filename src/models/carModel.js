const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    year: {
      type: Number,
      required: true,
      min: 1990,
    },

    plateNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    vinNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    batteryCapacity: {
      type: Number, 
      required: true,
    },

    rangePerCharge: {
      type: Number, 
      required: true,
    },

    chargingType: {
      type: String,
      enum: ['fast', 'normal'],
      default: 'normal',
    },

    seats: {
      type: Number,
      default: 4,
    },

    transmission: {
      type: String,
      enum: ['automatic'],
      default: 'automatic',
    },

    features: [
      {
        type: String,
      },
    ],

    images: [
      {
        type: String, 
      },
    ],

    status: {
      type: String,
      enum: [
        'available',
        'reserved',
        'rented',
        'maintenance',
        'inactive',
      ],
      default: 'available',
    },

    pricePerHour: {
      type: Number,
      required: true,
    },

    pricePerDay: {
      type: Number,
      required: true,
    },

    lateFeePerHour: {
      type: Number,
      default: 0,
    },

    depositAmount: {
      type: Number,
      default: 0,
    },

    location: {
      city: {
        type: String,
        required: true,
      },
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      parkingSpot: {
        type: String,
      },
    },

    currentBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },

    lastUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // =========================
    // Analytics
    // =========================
    totalTrips: {
      type: Number,
      default: 0,
    },

    totalRevenue: {
      type: Number,
      default: 0,
    },

    totalHoursUsed: {
      type: Number,
      default: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },


    lastMaintenanceDate: {
      type: Date,
    },

    nextMaintenanceDate: {
      type: Date,
    },

    // =========================
    // IoT / Security
    // =========================
    isLocked: {
      type: Boolean,
      default: true,
    },

    iotDeviceId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Car', carSchema);
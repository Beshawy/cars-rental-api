const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: true
    },

    type: {
      type: String,
      enum: ['accident', 'battery', 'breakdown', 'theft', 'medical'],
      required: true
    },

    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'cancelled'],
      default: 'pending'
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    },

    description: {
      type: String,
      trim: true
    },

    resolvedAt: Date
  },
  { timestamps: true }
);

emergencySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Emergency', emergencySchema);
const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Car",
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  duration: {
    type: Number,
    required: true
  },

  durationType: {
    type: String,
    enum: ["hours", "days"],
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending"
  },

  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active"
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for payment
reservationSchema.virtual('payment', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'reservation',
  justOne: true
});

module.exports = mongoose.model("Reservation", reservationSchema);
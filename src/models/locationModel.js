const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['car', 'charging_station', 'user', 'emergency'],
            required: true
        },

        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        },

        onModel: {
            type: String,
            required: true,
            enum: ['Car', 'ChargingStation', 'User', 'Emergency']
        },

        reference: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'onModel'
        },

        isStatic: {
            type: Boolean,
            default: false
        },

        address: String,
        city: String,

        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// 🔍 Index spatial data
locationSchema.index({ location: '2dsphere' });
locationSchema.index({ type: 1 });
locationSchema.index({ reference: 1 });

module.exports = mongoose.model('Location', locationSchema);

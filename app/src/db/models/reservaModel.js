const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    checkIn: String,
    checkOut: String,
    adults: {
      type: Number, 
      min: 1, 
      required: true,
    },
    children: Number,
    babies: Number,
    totalAmount: Number,
    stripeSessionId: { type: String, required: true }, // Stripe session ID
    customerId: { 
      type: String, 
      required: true,
    }, // Stripe customer ID
    paymentStatus: String,
    paymentId: { 
      type: String, 
      required: true, // Ensure paymentId is always included
    }, 
}, { timestamps: true });

module.exports = mongoose.model('Reservation', ReservationSchema);
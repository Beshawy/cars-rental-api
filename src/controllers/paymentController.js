const asyncHandler = require('express-async-handler');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/paymentModel');
const Reservation = require('../models/reservationModel');
const Car = require('../models/carModel');
const AppError = require('../utils/AppError');
const { createPaymentSchema } = require('../utils/validation/paymentValidation');
const paypal = require('@paypal/checkout-server-sdk');

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_SECRET;
const environment = process.env.PAYPAL_MODE === 'live'
  ? new paypal.core.LiveEnvironment(clientId, clientSecret)
  : new paypal.core.SandboxEnvironment(clientId, clientSecret);
const paypalClient = new paypal.core.PayPalHttpClient(environment);

exports.createPayment = asyncHandler(async (req, res, next) => {
  // 1️⃣ Validate
  const { error } = createPaymentSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const { reservationId } = req.body;

  // 2️⃣ هات الحجز
  const reservation = await Reservation.findById(reservationId).populate('car');

  if (!reservation) {
    return next(new AppError('الحجز غير موجود', 404));
  }

  // 3️⃣ احسب السعر
  let amount = 0;

  if (reservation.durationType === 'hour') {
    amount = reservation.duration * reservation.car.pricePerHour;
  } else {
    amount = reservation.duration * reservation.car.pricePerDay;
  }

  // 4️⃣ PaymentIntent (CARD ONLY 👈)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // بالقرش
    currency: 'egp',
    payment_method_types: ['card'], // ✅ دي أهم سطر
    metadata: {
      reservationId: reservation._id.toString(),
      userId: req.user._id.toString(),
    },
  });

  // 5️⃣ خزّن في DB
  const payment = await Payment.create({
    user: req.user._id,
    reservation: reservation._id,
    car: reservation.car._id,
    amount,
    paymentIntentId: paymentIntent.id,
    status: 'pending',
  });

  // 6️⃣ Response
  res.status(201).json({
    status: 'success',
    message: 'تم إنشاء عملية الدفع',
    data: {
      paymentId: payment._id,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount,
      currency: 'EGP',
    },
  });
});


exports.createPayPalOrder = asyncHandler(async (req, res, next) => {
  const { reservationId } = req.body;

  // 1️⃣ تحقق من الحجز
  const reservation = await Reservation.findById(reservationId).populate('car');
  if (!reservation) return next(new AppError('reservation not found', 404));

  // 2️⃣ حساب المبلغ
  let amount = 0;
  if (reservation.durationType === 'hour') {
    amount = reservation.duration * reservation.car.pricePerHour;
  } else {
    amount = reservation.duration * reservation.car.pricePerDay;
  }

  // 3️⃣ إنشاء طلب الدفع على PayPal
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: amount.toString(),
        },
        description: `حجز سيارة ${reservation.car.name}`,
      },
    ],
  });

  const order = await paypalClient.execute(request);

  // 4️⃣ خزّن الـ Payment في DB (status pending)
  const payment = await Payment.create({
    user: req.user._id,
    reservation: reservation._id,
    car: reservation.car._id,
    amount,
    paymentMethod: 'paypal',
    paymentId: order.result.id, // id بتاع PayPal order
    status: 'pending',
  });

  // 5️⃣ Response للفرونت مع رابط الموافقة
  const approvalLink = order.result.links.find(link => link.rel === 'approve')?.href;

  res.status(201).json({
    status: 'success',
    message: 'تم إنشاء طلب الدفع على PayPal',
    data: {
      paymentId: payment._id,
      orderID: order.result.id,
      approvalLink,
    },
  });
});

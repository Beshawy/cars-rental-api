const asyncHandler = require('express-async-handler');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/paymentModel');
const Reservation = require('../models/reservationModel');
const Car = require('../models/carModel');
const { sendEmail } = require('../utils/email');

exports.stripeWebhook = asyncHandler(async (req, res) => {
    let event;

    const sig = req.headers['stripe-signature'];

    try {
        // تحقق من صحة الحدث باستخدام الـ Webhook secret
        event = stripe.webhooks.constructEvent(
            req.body, // express.raw puts the raw Buffer in req.body
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.log(' Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.created':
        case 'charge.succeeded':
        case 'charge.updated':
            // we can log if we want, but these are expected
            break;

        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;

            // 1️⃣ تحديث الدفع في الداتا بيز واسترجاع بيانات المستخدم
            const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id }).populate('user');

            if (payment) {
                payment.status = 'paid';
                await payment.save();

                // 2️⃣ تحديث حالة الحجز
                const reservation = await Reservation.findById(payment.reservation).populate('car');
                if (reservation) {
                    reservation.paymentStatus = 'paid';
                    reservation.status = 'active';
                    await reservation.save();

                    // 3️⃣ تأكيد حجز العربية
                    const car = await Car.findById(reservation.car);
                    if (car) {
                        car.status = 'reserved';
                        await car.save();
                        console.log(`✅ Car ${car.plateNumber} is now reserved for reservation ${reservation._id}`);
                    }

                    // 4️⃣ إرسال إشعار للعميل
                    try {
                        await sendEmail({
                            to: payment.user.email,
                            subject: 'تأكيد الدفع والحجز - CARS ERP',
                            html: `
                                <div dir="rtl" style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                                    <h2 style="color: #4CAF50;">تم تأكيد دفعك بنجاح! </h2>
                                    <p>عزيزي <b>${payment.user.name}</b>،</p>
                                    <p>لقد استلمنا دفعتك بمبلغ <b>${payment.amount} EGP</b> بنجاح.</p>
                                    <hr>
                                    <p><b>تفاصيل الحجز:</b></p>
                                    <ul>
                                        <li>رقم الحجز: ${reservation._id}</li>
                                        <li>العربية: ${reservation.car.brand} ${reservation.car.model} (${reservation.car.plateNumber})</li>
                                        <li>المدة: ${reservation.duration} ${reservation.durationType}</li>
                                        <li>تاريخ انتهاء الحجز: ${reservation.endTime.toLocaleString('ar-EG')}</li>
                                    </ul>
                                    <p>نتمنى لك رحلة سعيدة وموفقة! </p>
                                </div>
                            `
                        });
                        console.log(`📧 Confirmation email sent to ${payment.user.email}`);
                    } catch (emailErr) {
                        console.error('❌ Failed to send confirmation email:', emailErr.message);
                    }
                }
            }
            break;

        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('❌ Payment failed for:', failedPayment.id);

            const paymentRecord = await Payment.findOne({ paymentIntentId: failedPayment.id });
            if (paymentRecord) {
                paymentRecord.status = 'failed';
                await paymentRecord.save();

                // رجوع العربية لليوزر التاني لو الدفع فشل والحجز اتلغى
                const reservation = await Reservation.findById(paymentRecord.reservation);
                if (reservation) {
                    // هنا ممكن نغير حالة الحجز لـ "cancelled" لو كان ده مسموح في السيستم
                    // لكن الأهم نرجع العربية متاحة
                    const car = await Car.findById(reservation.car);
                    if (car) {
                        car.status = 'available';
                        await car.save();
                        console.log(`🔄 Payment failed. Car ${car.plateNumber} returned to available status.`);
                    }
                }
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
});
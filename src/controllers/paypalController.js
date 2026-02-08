const paypal = require('@paypal/checkout-server-sdk');
const asyncHandler = require('express-async-handler');
const AppError = require('../utils/AppError');
const Payment = require('../models/paymentModel');
const Reservation = require('../models/reservationModel');

// إعداد PayPal client
function paypalClient() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_SECRET;
    const environment = (process.env.PAYPAL_MODE || 'sandbox').trim() === 'live'
        ? new paypal.core.LiveEnvironment(clientId, clientSecret)
        : new paypal.core.SandboxEnvironment(clientId, clientSecret);
    return new paypal.core.PayPalHttpClient(environment);
}

//  Capture Payment
exports.capturePayment = asyncHandler(async (req, res, next) => {
    const { orderID, reservationId, userId } = req.body;

    if (!orderID || !reservationId || !userId) {
        return next(new AppError('orderID, reservationId و userId مطلوبين', 400));
    }

    const client = paypalClient();
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({}); // capture request body فارغ

    let capture;
    try {
        capture = await client.execute(request);
    } catch (err) {
        console.error('PayPal Capture Error:', err);

        // محاولة فك رسالة الخطأ لو كانت JSON (باي بال بيبعتها كـ stringified JSON)
        let errorMessage = 'فشل تأكيد الدفع من PayPal';
        try {
            const parsedError = JSON.parse(err.message);
            if (parsedError.details && parsedError.details[0]) {
                errorMessage = parsedError.details[0].description || parsedError.message;
            } else if (parsedError.message) {
                errorMessage = parsedError.message;
            }
        } catch (e) {
            errorMessage = err.message || errorMessage;
        }

        return next(new AppError(errorMessage, err.statusCode || 500));
    }

    // تحقق من حالة الدفع
    if (!capture || !capture.result) {
        return next(new AppError('استجابة PayPal غير صالحة', 500));
    }

    const status = capture.result.status;

    if (status === 'COMPLETED') {

        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return next(new AppError('الحجز غير موجود', 404));
        }
        reservation.status = 'confirmed';
        await reservation.save();

        // 2️⃣ حفظ عملية الدفع
        const amount = capture.result.purchase_units[0].payments.captures[0].amount.value;
        const currency = capture.result.purchase_units[0].payments.captures[0].amount.currency_code;

        const payment = await Payment.create({
            user: req.user._id, // Use authenticated user
            reservation: reservationId,
            amount,
            currency,
            paymentMethod: 'PayPal',
            status: 'paid', // Match model field name 'status'
            transactionId: capture.result.id,
        });

        reservation.paymentStatus = 'paid'; // Sync reservation payment status
        await reservation.save();

        //  ممكن تبعت ايميل للعميل هنا

        return res.status(200).json({
            status: 'success',
            message: 'تم تأكيد الدفع بنجاح عبر PayPal',
            payment,
        });
    } else {
        // الدفع لم يكتمل
        return next(new AppError(`الدفع لم يكتمل. الحالة الحالية: ${status}`, 400));
    }
}); 
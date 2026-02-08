const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/dbConnection');
const globalErrorHandler = require('./middleware/errorMiddleware');
const notFoundMiddleware = require('./middleware/notFoundMiddleware');
const authRouter = require('./routes/authRoutes');
const profileRouter = require('./routes/profileRoutes');
const adminRouter = require('./routes/adminRoute');
const carRouter = require('./routes/carRoute');
const locationRouter = require('./routes/locationRoute');
const chargingStationRouter = require('./routes/chargingStationRoute');
const trackingRouter = require('./routes/trackingRoute');
const emergencyRouter = require('./routes/emergencyRoute');
const reservationRouter = require('./routes/reservationRoute');
const paymentRouter = require('./routes/paymentRoute');
const webhookRouter = require('./routes/webHookRoute');
const adminDashboardRouter = require('./routes/adminDashbordRoute');
const paypalRouter = require('./routes/paypalRoute');
const customerReportsRouter = require('./routes/customerReportsRoute');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');


// Connect to database 
connectDB();

const app = express();

// cron job
require('./reservationCron');


// Middleware & Security
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// Webhook (Needs raw body) - MUST be defined before global body parsers
app.use(
    '/api/v1/webhook',
    express.raw({ type: 'application/json' }),
    webhookRouter
);

// Rate limiting
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Fix for "Cannot set property query of #<IncomingMessage> which has only a getter"
app.use((req, res, next) => {
    if (req.query) {
        const query = Object.assign({}, req.query);
        Object.defineProperty(req, 'query', {
            value: query,
            writable: true,
            configurable: true,
            enumerable: true
        });
    }
    next();
});

// Data sanitization - Must be after body parsers
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// =====================
// Routes
// =====================
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to CARS ERP API'
    });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/car', carRouter);
app.use('/api/v1/location', locationRouter);
app.use('/api/v1/charging-station', chargingStationRouter);
app.use('/api/v1/tracking', trackingRouter);
app.use('/api/v1/emergency', emergencyRouter);
app.use('/api/v1/reservation', reservationRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/paypal', paypalRouter);
app.use('/api/v1/customer-reports', customerReportsRouter);
app.use('/api/v1/admin-dashboard', adminDashboardRouter);


// Not found middleware
app.use(notFoundMiddleware);


const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}


app.use(globalErrorHandler);

module.exports = app;








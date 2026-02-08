const cron = require('node-cron');
const Reservation = require('./models/reservationModel');
const Car = require('./models/carModel');

cron.schedule('* * * * *', async () => {
    const now = new Date();

    const endedReservations = await Reservation.find({ endTime: { $lte: now } });

    for (const resv of endedReservations) {
        const car = await Car.findById(resv.car);
        if (car) {
            car.status = 'available';
            await car.save();
        }

    }
});


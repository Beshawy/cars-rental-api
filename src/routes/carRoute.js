const express = require('express') ;
const router = express.Router();
const {protect ,restrictTo } = require('../middleware/authMiddleware');
const { createCar , updateCar , deleteCar , getAllCars , getCarById , getCarByName , searchCars  } = require('../controllers/carControl');
const { uploadCarImage } = require('../controllers/carControl');
const { upload } = require('../utils/uploadImage');


router.post('/' , protect , restrictTo('admin') , createCar);
router.get('/' , protect , getAllCars);
router.get('/search' , protect , searchCars);
router.get('/:id' , protect , getCarById);
router.get('/' , protect , getCarByName);
router.put('/:id' , protect , restrictTo('admin') , updateCar);
router.delete('/:id' , protect , restrictTo('admin') , deleteCar);
router.put('/upload-image/:id' , protect , restrictTo('admin'), upload.single('image') , uploadCarImage);


module.exports = router; 


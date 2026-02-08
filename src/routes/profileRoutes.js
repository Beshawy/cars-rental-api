const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../utils/uploadImage');


router.use(authMiddleware.protect);



router.patch('/', profileController.updateProfile);
router.get('/:userId', profileController.getMe);
router.patch('/profile-image', upload.single('profileImage'), profileController.updateProfileImage);
router.post('/change-password', profileController.changePassword);
router.patch('/upload-driving-license', upload.single('drivingLicense'), profileController.uploadDrivingLicense);
router.delete('/delete-account', profileController.deleteAccount);

module.exports = router;



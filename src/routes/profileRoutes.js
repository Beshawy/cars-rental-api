const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../utils/uploadImage');


router.use(authMiddleware.protect);



/**
 * @swagger
 * /api/v1/profile:
 *   patch:
 *     summary: Update basic profile info
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch('/', profileController.updateProfile);

/**
 * @swagger
 * /api/v1/profile/{userId}:
 *   get:
 *     summary: Get profile by User ID
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User profile data
 */
router.get('/:userId', profileController.getMe);

/**
 * @swagger
 * /api/v1/profile/profile-image:
 *   patch:
 *     summary: Update profile image
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Image updated
 */
router.patch('/profile-image', upload.single('profileImage'), profileController.updateProfileImage);

/**
 * @swagger
 * /api/v1/profile/change-password:
 *   post:
 *     summary: Change password
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.post('/change-password', profileController.changePassword);

/**
 * @swagger
 * /api/v1/profile/upload-driving-license:
 *   patch:
 *     summary: Upload/Update driving license
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               drivingLicense: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: License uploaded
 */
router.patch('/upload-driving-license', upload.single('drivingLicense'), profileController.uploadDrivingLicense);

/**
 * @swagger
 * /api/v1/profile/delete-account:
 *   delete:
 *     summary: Delete own account
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Account deleted
 */
router.delete('/delete-account', profileController.deleteAccount);

module.exports = router;



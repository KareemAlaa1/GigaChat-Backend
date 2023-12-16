const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth_controller');
const notificationsController = require('../controllers/notifications_controller');

router.get('/notifications', authController.protect, notificationsController.getNotifications);
router.get('/notifications/unseenCount', authController.protect, notificationsController.getNotificationsCount);
router.post('/notifications/markAllAsSeen', authController.protect, notificationsController.markAllNotificationsAsSeen);

module.exports = router;
const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.all('/signup', authController.signUp);
router.post('/confirmEmail', authController.confirmEmail);
router.post('/resendConfirmEmail', authController.resendConfirmEmail);
router.patch('/AssignUsername', authController.AssignUsername);
router.patch('/AssignPassword', authController.AssignPassword);
router.post('/login', authController.login);

//  Micro endPoints router
router.post('/checkBirthDate', userController.checkBirthDate);
router.post('/checkAvailableUsername', userController.checkAvailableUsername);
router.post('/checkAvailableEmail', userController.checkAvailableEmail);
router.post('/checkExistedEmail', userController.checkExistedEmail);

module.exports = router;

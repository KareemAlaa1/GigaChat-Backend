const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.all('/signup', authController.signUp);
router.post('/login', authController.login);

//  Micro endPoints router
router.post('/checkBirthDate', userController.checkBirthDate);
router.post('/checkAvailableUsername', userController.checkAvailableUsername);
router.post('/checkAvailableEmail', userController.checkAvailableEmail);
router.post('/checkExistedEmail', userController.checkExistedEmail);

module.exports = router;

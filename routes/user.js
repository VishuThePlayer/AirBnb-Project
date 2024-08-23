const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');

router.get('/signup', authController.renderSignupForm);

router.post('/signup', authController.signup);

router.get('/login', authController.renderLoginForm);

router.post('/login', authController.login);

router.get('/logout', authController.logout);

module.exports = router;

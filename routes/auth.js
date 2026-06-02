const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

const { check, body } = require('express-validator');

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);

router.post('/signup', 
    [check('email')
    .isEmail()
    .withMessage('Please enter a valid email!')
    .custom((value, {req})=>{
        if (value === 'test@test.com') {
            throw new Error('This email address is not allowed!');
        }
        return true;
    }),
    body('password', 'Please enter a password with at least 5 characters and only alphabets and numbers!')
    .isLength({min: 5})
    .isAlphanumeric(),
    body('confirmPassword')
    .custom((value, {req})=>{
        if(value!==req.body.password){
            throw new Error('Passwords have to match!');
        }
        return true;
    })

    ] , 
    authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset)

router.get('/new-password/:token', authController.getNewPassword);  //dynamic parameter

router.post('/new-password', authController.postNewPassword)

module.exports = router;
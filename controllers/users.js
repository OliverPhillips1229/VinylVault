const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const passUserToView = require('../middleware/pass-user-to-view.js');

router.use(passUserToView);

router.get('/', (req, res) => {
    res.render('users/index');
});

router.get('/:userId', (req, res) => {
    res.render('users/show');
});


module.exports = router;
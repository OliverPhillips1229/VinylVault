const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const passUserToView = require('../middleware/pass-user-to-view.js');

router.use(passUserToView);

router.get('/', (req, res) => {
    res.render('users/index');
});

router.get('/:userId', (req, res) => {
    if (!req.session.user || req.session.user._id !== req.params.userId) {
        return res.status(403).send('Forbidden');
    }
    const user = req.session.user;
    res.render('users/show', { user });
    
});


module.exports = router;
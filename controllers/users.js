const express = require('express');
const router = express.Router();
const User = require('../models/vinyl.js');

router.get('/', async (req, res) => {
    try {
        const users = await User.find({});
        res.render('users/index', { users });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        res.render('users/show', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
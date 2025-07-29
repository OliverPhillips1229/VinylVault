const express = require('express');
const router = express.Router();
const VinylVault = require('../models/vinyl.js');
const { render } = require('ejs');

router.get('/', async (req, res) => {
    try {
        const vinyls = await VinylVault.find({ owner: req.session.user._id });
        res.render('vinyls/index', { vinyls });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
        res.redirect('/vinyls');
    }
});

router.get('/new', (req, res) => {
    res.render('vinyls/new');
});

router.post('/', async (req, res) => {
    try {
        const newVinyl = await VinylVault.create({
            ...req.body,
            owner: req.session.user._id,
        });
        res.redirect(`/vinyls`);
    } catch (error) {
        console.error(error);
        res.status(400).send('Failed to create vinyl record.');
    }
});

router.get('/:vinylId/edit', async (req, res) => {
    try {
        const vinyl = await VinylVault.findById(req.params.vinylId, { owner: req.session.user._id });
        res.render('vinyls/edit', { vinyl });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
        res.redirect('/vinyls');
    }
});

router.put('/:vinylId', async (req, res) => {
    try {
        await VinylVault.findByIdAndUpdate(req.params.vinylId, { owner: req.session.user._id, ...req.body });
        res.redirect('/vinyls');
    } catch (error) {
        console.error(error);
        res.status(400).send('Bad Request');
        res.redirect('/vinyls');
    }
});

router.delete('/:vinylId', async (req, res) => {
    try {
        await VinylVault.findByIdAndDelete(req.params.vinylId, { owner: req.session.user._id });
        res.redirect('/vinyls');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
        res.redirect('/vinyls');
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const VinylVault = require('../models/vinyl.js');
const { render } = require('ejs');
const isSignedIn = require('../middleware/is-signed-in');
const passUserToView = require('../middleware/pass-user-to-view');

router.use(isSignedIn);
router.use(passUserToView);

router.get('/', async (req, res) => {
    try {
        const vinyls = await VinylVault.find({ owner: req.session.user._id, wishlist: false });
        const wishlistItems = await VinylVault.find({ owner: req.session.user._id, wishlist: true });
        res.render('vinyls/index', { vinyls, wishlistItems });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
        res.redirect('/vinyls');
    }
});

router.get('/new', (req, res) => {
    const genres = [
        "Rock", "Pop", "Hip-Hop", "Jazz", "Electronic", "Classical",
        "Soul", "R&B", "Funk", "Folk", "Reggae", "Punk", "Country", "Indie", "Other"
    ];
    res.render('vinyls/new', { genres });
});

router.post('/', async (req, res) => {
    try {
        console.log('User session:', req.session.user); // Debug user session
        console.log('Request body:', req.body); // Debug form data
        
        const newVinyl = await VinylVault.create({
            ...req.body,
            wishlist: !!req.body.wishlist,
            owner: req.session.user._id,
        });
        
        console.log('Created vinyl:', newVinyl); // Debug created vinyl
        res.redirect(`/vinyls`);
    } catch (error) {
        console.error(error);
        res.status(400).send('Failed to create vinyl record.');
    }
});

router.get('/wishlist', async (req, res) => {
    try {
        const wishlist = await VinylVault.find({ owner: req.session.user._id, wishlist: true });
        res.render('vinyls/wishlist', { vinyls: wishlist });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
        res.redirect('/vinyls');
    }
});

router.post('/:id/move-to-collection', async (req, res) => {
    try {
        await VinylVault.findByIdAndUpdate(req.params.id, { wishlist: false });
        res.redirect('/vinyls/wishlist');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
        res.redirect('/vinyls/wishlist');
    }
});

router.delete('/:id/wishlist', async (req, res) => {
    try {
        await VinylVault.findByIdAndDelete(req.params.id);
        res.redirect('/vinyls/wishlist');
    } catch (error) {
        console.error(error);
        res.status(500).send('Could not remove from wishlist');
        res.redirect('/vinyls/wishlist');
    }
});

router.get('/:vinylId/edit', async (req, res) => {
    try {
        const vinyl = await VinylVault.findOne({ _id: req.params.vinylId, owner: req.session.user._id });
        res.render('vinyls/edit', { vinyl });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
        res.redirect('/vinyls');
    }
});

router.put('/:vinylId', async (req, res) => {
  try {
    req.body.wishlist = !!req.body.wishlist;
    await VinylVault.findByIdAndUpdate(req.params.vinylId, { owner: req.session.user._id, ...req.body });
    res.redirect('/vinyls');
  } catch (error) {
    console.error(error);
    res.status(400).send('Failed to update vinyl.');
  }
});


router.delete('/:vinylId', async (req, res) => {
    try {
        await VinylVault.findOneAndDelete({ _id: req.params.vinylId, owner: req.session.user._id });
        res.redirect('/vinyls');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
        res.redirect('/vinyls');
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const VinylVault = require('../models/vinyl.js');
const passUserToView = require('../middleware/pass-user-to-view.js');

router.use(passUserToView);

router.get('/', (req, res) => {
    res.render('users/index');
});

router.get('/:userId', async (req, res) => {
    if (!req.session.user || req.session.user._id !== req.params.userId) {
        return res.status(403).send('Forbidden');
    }
    
    try {
        const userId = req.session.user._id;
        
        // Get user data
        const user = await User.findById(userId);
        
        // Get collection statistics
        const totalRecords = await VinylVault.countDocuments({ owner: userId, wishlist: false });
        const wishlistCount = await VinylVault.countDocuments({ owner: userId, wishlist: true });
        
        // Get favorite genre
        const genreStats = await VinylVault.aggregate([
            { $match: { owner: userId, wishlist: false, genre: { $exists: true, $ne: "" } } },
            { $group: { _id: "$genre", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);
        
        const favoriteGenre = genreStats.length > 0 ? genreStats[0]._id : "Not yet determined";
        
        const stats = {
            totalRecords,
            wishlistCount,
            favoriteGenre
        };
        
        res.render('users/show', { user, stats });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).send('Error loading profile');
    }
});


module.exports = router;
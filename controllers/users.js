const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const VinylVault = require('../models/vinyl.js');
const passUserToView = require('../middleware/pass-user-to-view.js');

router.use(passUserToView);

router.get('/', async (req, res) => {
    try {
        // Get all users with their vinyl counts
        const users = await User.find({}).select('username email createdAt');
        
        // Get vinyl counts and favorite genre for each user
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const totalVinyls = await VinylVault.countDocuments({ 
                    owner: user._id, 
                    wishlist: false 
                });
                const wishlistCount = await VinylVault.countDocuments({ 
                    owner: user._id, 
                    wishlist: true 
                });
                
                // Get genre statistics for this user
                const genreStats = await VinylVault.aggregate([
                    { 
                        $match: { 
                            owner: user._id, 
                            wishlist: false, 
                            genre: { $exists: true, $ne: "" } 
                        } 
                    },
                    { $group: { _id: "$genre", count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ]);
                
                // Determine favorite genre based on your logic
                let favoriteGenre = "Eclectic taste";
                
                if (genreStats.length > 0) {
                    // Check if any genre has 2 or more records
                    const genresWithTwoOrMore = genreStats.filter(g => g.count >= 2);
                    
                    if (genresWithTwoOrMore.length > 0) {
                        const maxCount = genresWithTwoOrMore[0].count;
                        const topGenres = genresWithTwoOrMore.filter(g => g.count === maxCount);
                        
                        if (topGenres.length === 1) {
                            // Single favorite genre
                            favoriteGenre = topGenres[0]._id;
                        } else {
                            // Multiple genres tied for first place
                            favoriteGenre = topGenres.map(g => g._id).join(', ');
                        }
                    }
                    // If no genre has 2 or more, it stays "Eclectic taste"
                }
                
                return {
                    ...user.toObject(),
                    totalVinyls,
                    wishlistCount,
                    favoriteGenre,
                    memberSince: user.createdAt
                };
            })
        );
        
        // Sort by total vinyls (highest first)
        usersWithStats.sort((a, b) => b.totalVinyls - a.totalVinyls);
        
        res.render('users/index', { users: usersWithStats });
    } catch (error) {
        console.error('Error fetching community data:', error);
        res.render('users/index', { users: [] });
    }
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
        
        // Get favorite genre using same logic as community page
        const genreStats = await VinylVault.aggregate([
            { $match: { owner: userId, wishlist: false, genre: { $exists: true, $ne: "" } } },
            { $group: { _id: "$genre", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        let favoriteGenre = "Eclectic taste";
        
        if (genreStats.length > 0) {
            // Only consider it a favorite if they have 2 or more records in that genre
            const genresWithTwoOrMore = genreStats.filter(genre => genre.count >= 2);
            
            if (genresWithTwoOrMore.length > 0) {
                const maxCount = genresWithTwoOrMore[0].count;
                const topGenres = genresWithTwoOrMore.filter(genre => genre.count === maxCount);
                
                if (topGenres.length === 1) {
                    // Single favorite genre
                    favoriteGenre = topGenres[0]._id;
                } else {
                    // Multiple genres tied for first place
                    favoriteGenre = topGenres.map(g => g._id).join(', ');
                }
            }
            // If no genre has 2 or more, it stays "Eclectic taste"
        }
        
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
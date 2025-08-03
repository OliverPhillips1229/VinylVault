const mongoose = require("mongoose");

const VinylVaultSchema = new mongoose.Schema({
    artist: { type: String, required: true },
    albumTitle: { type: String, required: true },
    genre: { type: String },
    year: { type: Number },
    coverArt: { type: String }, // URL to the cover art image
    notes: { type: String },
    wishlist: { type: Boolean, default: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    // Enhanced fields for Discogs integration
    discogsId: { 
        type: String,
        index: true // For faster lookups when searching by Discogs ID
    },
    discogsData: {
        masterId: { type: String },
        catalogNumber: { type: String },
        label: { type: String },
        country: { type: String },
        released: { type: String },
        },
    }
,);

module.exports = mongoose.model("VinylVault", VinylVaultSchema);
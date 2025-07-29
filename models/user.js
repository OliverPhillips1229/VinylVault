const mongoose = require("mongoose");

const VinylVaultSchema = new mongoose.Schema({
    artist: { type: String, required: true },
    albumTitle: { type: String, required: true },
    genre: { type: String },
    year: { type: Number },
    coverArt: { type: String }, // URL to the cover art image
    notes: { type: String },
    wishlist: { type: Boolean, default: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

module.exports = mongoose.model("VinylVault", VinylVaultSchema);
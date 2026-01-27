const mongoose = require('mongoose');

const titleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
}, { timestamps: true });

const Title = mongoose.model('Title', titleSchema);

module.exports = Title;
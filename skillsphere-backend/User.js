const mongoose = require('mongoose');

// Define what fields a user entry must have in our database
const UserSchema = new mongoose.Schema({
 name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    // 🌟 New Professional Fields
    title: { type: String, default: "" },
    bio: { type: String, default: "" },
    rate: { type: String, default: "0" }
});

module.exports = mongoose.model('User', UserSchema);
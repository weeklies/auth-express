const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true },
    // This is hashed using bcrypt.
    password: { type: String, required: true }
});

module.exports = mongoose.model("User", UserSchema);

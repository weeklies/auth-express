const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  // Not using first and last name as it may not be inclusive.
  fullname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  member: { type: Boolean, required: true },
  admin: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', UserSchema);

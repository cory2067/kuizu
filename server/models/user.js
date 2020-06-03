const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  googleid: String,
});

// compile model from schema
module.exports = mongoose.model("User", UserSchema);

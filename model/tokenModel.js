const mongoose = require('mongoose');
const tokenSchema = mongoose.Schema(
  {
    user: mongoose.Schema.Types.ObjectId,
    token: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Token = mongoose.model('Token', tokenSchema);
module.exports = Token;

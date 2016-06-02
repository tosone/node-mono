var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var Schema = mongoose.Schema;

var adminAccountSchema = new Schema({
  name: String,
  hash: String,
  salt: String,
  role: {type: Schema.Types.ObjectId, ref: 'Role'},
  createdAt: {type: Date, default: Date.now},
  updatedAt: Date,
  deletedAt: Date
});

adminAccountSchema.plugin(passportLocalMongoose, {
  usernameField: 'name',
  saltField: 'salt',
  hashField: 'hash'
});

module.exports = mongoose.model('AdministratorAccount', adminAccountSchema);

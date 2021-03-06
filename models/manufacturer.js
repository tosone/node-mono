var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var manufacturerSchema = new Schema({
  name: {type: String, required: true},
  code: {type: String, default: Date.now, required: true, unique: true}
});

module.exports = mongoose.model('Manufacturer', manufacturerSchema);

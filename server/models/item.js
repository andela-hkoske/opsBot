var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ItemsSchema = new Schema({
  title: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  
  picture_url: {
    type: String,
    required: true
  },

  created_at: {
    type: Date
  },

  updated_at: {
    type: Date
  },

  owner: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Items', ItemsSchema);

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RequestSchema = new Schema({
  owner: {
    type: String,
    required: true
  },

  created_at: {
    type: Date
  },

  updated_at: {
    type: Date
  },

  title: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },

  description: {
    type: String,
    required: true
  },

  item: {
    type: Schema.Types.ObjectId,
    ref: 'Items',
    required: true
  }
});

RequestSchema.pre('save', function(next) {
  var now = new Date();
  this.updated_at = now;
  if (!this.created_at) {
    this.created_at = now;
  }
  next();
});


module.exports = mongoose.model('Request', RequestSchema);

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  hint: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    trim: true,
    index: {
      unique: true
    },
    validate: {
      validator: function(v) {
        return (/^\S+@\S+\.\S+$/).test(v);
      },
      message: '{VALUE} is not a valid email address!'
    }
  }
});

UserSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) {
    next();
  }
  bcrypt.hash(user.password, null, null, function(err, hash) {
    if (err) {
      return next(err);
    } else {
      user.password = hash;
      next();
    }
  });
});

UserSchema.methods.comparePassword = function(password) {
  var user = this;
  return bcrypt.compareSync(password, user.password);
};


module.exports = mongoose.model('User', UserSchema);

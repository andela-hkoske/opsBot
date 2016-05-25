var User = require('../models/user');
var env = process.env.NODE_ENV || 'development';
var Request = require('../models/request');
var config = require('../config')[env];
var jsonwebtoken = require('jsonwebtoken');
var secretKey = config.secretKey;
var bcrypt = require('bcrypt-nodejs');

function createToken(user) {
  var token = jsonwebtoken.sign(user, secretKey, {
    expiresInMinute: 1440
  });
  return token;
}

module.exports = {
  session: function(req, res) {
    var token = req.headers['x-access-token'];
    if (token && token !== 'null') {
      jsonwebtoken.verify(token, secretKey,
        function(err, decoded) {
          if (err) {
            res.status(401).json({
              error: 'Session has expired or does not exist.'
            });
          } else {
            if (decoded._doc) {
              req.decoded = decoded._doc;
            } else {
              req.decoded = decoded;
            }
            User.findById(req.decoded._id)
              .populate('role')
              .exec(function(err, user) {
                if (err) {
                  res.status(500).json({
                    message: 'Error retrieving user',
                    err: err
                  });
                } else if (!user) {
                  res.status(500).json({
                    message: 'User not found'
                  });
                } else {
                  delete user.password;
                  req.decoded = user;
                  res.json(user);
                }
              });
          }
        });
    } else {
      return res.status(401).json({
        error: 'No token provided.'
      });
    }
  },

  signup: function(req, res) {
    var createUser = function(role) {
      var user = new User({
        name: {
          first: req.body.firstname,
          last: req.body.lastname
        },
        email: req.body.email,
        username: req.body.username,
        role: role,
        password: req.body.password
      });
      user.save(function(err) {
        if (err) {
          return res.status(500).send({
            success: false,
            message: err.message || err
          });
        } else {
          return res.json({
            success: true,
            message: 'User has been created!'
          });
        }
      });
    };
    if (req.body.role) {
      createUser(req.body.role);
    } else {
      Roles.find({
        title: 'Viewer'
      }, function(err, role) {
        if (err) {
          return res.status(500).send({
            success: false,
            message: err.message || err
          });
        } else {
          createUser(role[0]._id);
        }
      });
    }
  },

  getAll: function(req, res) {
    User.find({}, function(err, users) {
        if (err) {
          return res.status(500).send(err);
        }
        return res.json(users);
      })
      .populate('role');
  },

  findById: function(req, res) {
    User.findById(req.params.id, function(err, user) {
        if (err) {
          return res.status(500).send(err);
        }
        return res.json(user);
      })
      .populate('role');
  },

  find: function(req, res) {
    User.find({
        $or: [{
          name: {
            first: req.body.firstname
          }
        }, {
          name: {
            last: req.body.lastname
          }
        }, {
          email: req.body.email
        }, {
          role: req.body.role
        }, {
          username: req.body.username
        }]
      })
      .populate('role')
      .exec(function(err, user) {
        if (err) {
          return res.status(500).send(err);
        }
        return res.json(user);
      });
  },

  remove: function(req, res) {
    User.findByIdAndRemove(req.params.id,
      function(err, ok) {
        if (err) {
          return res.status(500).send(err);
        }
        Document.remove({
          owner: req.params.id
        }, function(err) {
          if (err) {
            return res.status(500).send(err);
          } else if (ok) {
            return res.send({
              success: true,
              message: 'Successfully deleted user and their documents.'
            });
          }
        });

      });
  },

  logout: function(req, res) {
    delete req.decoded;
    if (req.decoded) {
      return res.status(500).send({
        success: false,
        message: 'There was a problem logging out.'
      });
    } else {
      return res.send({
        success: true,
        message: 'Successfully logged out'
      });
    }
  },

  login: function(req, res) {
    User.findOne({
      username: req.body.username
    }).populate('role').exec(function(err, user) {
      if (err) {
        throw err;
      }
      if (!user) {
        return res.status(500).send({
          success: false,
          message: 'User doesn\'t exist'
        });
      } else if (user) {
        var validPassword = user.comparePassword(req.body.password);
        if (!validPassword) {
          return res.status(500).send({
            success: false,
            message: 'Invalid password'
          });
        } else {
          var tokenStr = createToken(user);
          return res.send({
            success: true,
            message: 'Successfully logged in',
            token: tokenStr,
            user: user
          });
        }
      }
    });
  },

  update: function(req, res) {
    var user_info, user_upd;
    User.findById(req.params.id, function(err, user) {
      if (err) {
        return res.status(500).send(err);
      }
      user_info = user;
      var save = function() {
        if (!req.body.name) {
          req.body.name = {};
        }
        if (!req.body.role) {
          req.body.role = {};
        }
        user_upd = {
          name: {
            first: req.body.name.first || user_info.name.first,
            last: req.body.name.last || user_info.name.last
          },
          email: req.body.email || user_info.email,
          role: req.body.role._id || user_info.role,
          username: req.body.username || user_info.username,
          password: req.body.password || user_info.password
        };
        User.findByIdAndUpdate(req.params.id, user_upd)
          .populate('role')
          .exec(function(err, user) {
            if (err) {
              return res.status(500).send(err.errmsg || err.message || err);
            } else {
              delete user.password;
              var tokenStr = createToken(user);
              return res.json({
                success: true,
                message: 'Successfully updated your profile',
                token: tokenStr,
                user: user
              });
            }
          });
      };
      if (req.body.password) {
        bcrypt.hash(req.body.password, null, null, function(err, hash) {
          if (err) {
            res.status(500).send({
              success: false,
              message: 'There was a problem saving your password.'
            });
          } else {
            req.body.password = hash;
            save();
          }
        });
      } else {
        save();
      }
    });
  }
};
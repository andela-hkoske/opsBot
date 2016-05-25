var Item = require('../models/item');

module.exports = {
  create: function(req, res) {
    var item = new Item({
      title: req.body.title
    });
    item.save(function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.errmsg || err
        });
      } else {
        return res.json({
          success: true,
          message: 'Successfully created a new item'
        });
      }
    });
  },

  update: function(req, res) {
    Item.findByIdAndUpdate(req.params.id, {
      title: req.body.title
    }, function(err) {
      if (err) {
        return res.status(500).send(err.errmsg || err);
      } else {
        return res.json({
          success: true,
          message: 'Successfully updated a item'
        });
      }
    });
  },

  getById: function(req, res) {
    Item.findById(req.params.id).exec(function(err, item) {
      if (err) {
        return res.status(500).send(err.errmsg || err);
      } else if (!item) {
        return res.status(500).json({
          success: false,
          message: 'Item not found'
        });
      } else {
        return res.send(item);
      }
    });
  },

  remove: function(req, res) {
    Item.findByIdAndRemove(req.params.id,
      function(err, ok) {
        if (err) {
          return res.status(500).send(err.errmsg || err);
        } else if (ok) {
          return res.send({
            success: true,
            message: 'Successfully deleted item.'
          });
        }
      });
  },

  getAll: function(req, res) {
    Item.find({}).exec(function(err, items) {
      if (err) {
        return res.status(500).send(err.errmsg || err);
      } else if (!items) {
        return res.status(500).json({
          success: false,
          message: 'Error accessing item'
        });
      } else {
        return res.send(items);
      }
    });
  },

  findByTitle: function(req, res) {
    Item.find({
      title: req.body.title
    }).exec(function(err, items) {
      if (err) {
        return res.status(500).send(err.errmsg || err);
      } else if (!items) {
        return res.status(500).json({
          success: false,
          message: 'Error accessing item'
        });
      } else {
        return res.send(items);
      }
    });
  }
};

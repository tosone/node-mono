var _ = require('lodash');

function mongoIdToWebId(entity) {
  var o = entity.toObject();
  o.id = o._id.toString();
  delete o._id;
  return o;
}

function checkScope(scope, permission) {
  scope = scope || [];
  return scope.indexOf(permission) === -1;
}

module.exports = function(resource, model) {
  var router = require('express').Router();
  var Model = require('mongoose').model(model);

  router.route('/' + resource)
    .get(function(req, res, next) {

      if (req.user.realm === 'administrator') {
        if (checkScope(req.scope, resource + ':read')) {
          return res.sendStatus(403);
        }
      }

      var page = req.query._page;
      var perPage = req.query._perPage;
      var sortField = req.query._sortField;
      var sortDir = req.query._sortDir;
      var filters = req.query._filters;

      var skip = parseInt((page - 1) * perPage);
      var limit = parseInt(perPage);
      var sort = {};
      try {sort[sortField] = sortDir.toLowerCase()} catch (err) {}
      try {filters = JSON.parse(req.query._filters)} catch (err) {}

      Promise.all([
        Model.count(filters),
        Model.find(filters).limit(limit).skip(skip).sort(sort)
      ]).then(function(result) {
        res.header('X-Total-Count', result[0]);
        res.json(result[1].map(mongoIdToWebId));
      }).catch(next);
    })
    .post(function(req, res, next) {

      if (req.user.realm === 'administrator') {
        if (checkScope(req.scope, resource + ':create')) {
          return res.sendStatus(403);
        }
      }

      var data = req.body;

      var entity = new Model(data);
      entity.save().then(function() {
        res.json(mongoIdToWebId(entity));
      }).catch(next);
    });

  router.route('/' + resource + '/:id')
    .get(function(req, res, next) {

      if (req.user.realm === 'administrator') {
        if (checkScope(req.scope, resource + ':read')) {
          return res.sendStatus(403);
        }
      }

      var id = req.params.id;

      Model.findById(id).then(function(entity) {
        if (!entity) throw new Error('not fount');
        res.json(mongoIdToWebId(entity));
      }).catch(next);
    })
    .put(function(req, res, next) {

      if (req.user.realm === 'administrator') {
        if (checkScope(req.scope, resource + ':update')) {
          return res.sendStatus(403);
        }
      }

      var id = req.params.id;
      var data = req.body;

      Model.findByIdAndUpdate(id, data).then(function(entity) {
        if (!entity) throw new Error('not fount');
        res.json(mongoIdToWebId(entity));
      }).catch(next);
    })
    .delete(function(req, res, next) {

      if (req.user.realm === 'administrator') {
        if (checkScope(req.scope, resource + ':delete')) {
          return res.sendStatus(403);
        }
      }

      var id = req.params.id;

      Model.findByIdAndRemove(id).then(function(entity) {
        if (!entity) throw new Error('not fount');
        res.json(mongoIdToWebId(entity));
      }).catch(next);
    });

  return router;
};

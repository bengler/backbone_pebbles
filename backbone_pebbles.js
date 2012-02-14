

/* backbone_pebbles.js.coffee */

(function() {
  var Collection, Model, assert_ns, backbone, getUrl, methodMap, pebblebone, pebblecore, _,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  pebblecore = require('pebblecore');

  _ = require('underscore');

  backbone = require('backbone');

  pebblebone = _.extend({}, backbone);

  assert_ns = function(obj, ns) {
    if (!obj.hasOwnProperty(ns)) {
      throw new Error('Invalid namespace for collection ' + this.constructor.name + ': "' + ns + '" (missing key in response)');
    }
    return true;
  };

  Model = (function(_super) {

    __extends(Model, _super);

    function Model() {
      Model.__super__.constructor.apply(this, arguments);
    }

    Model.prototype.parse = function(resp, xhr) {
      var ns;
      ns = this.namespace;
      if (ns && assert_ns(resp, ns)) return resp[ns];
      return resp;
    };

    Model.prototype.toJSON = function() {
      var attrs, ns, result;
      ns = this.namespace;
      attrs = _.clone(this.attributes);
      if (ns) {
        result = {};
        result[ns] = attrs;
        return result;
      } else {
        return attrs;
      }
    };

    Model.prototype.getAttributes = function() {
      return _.clone(this.attributes);
    };

    return Model;

  })(backbone.Model);

  pebblebone.Model = Model;

  Collection = (function(_super) {

    __extends(Collection, _super);

    function Collection() {
      Collection.__super__.constructor.apply(this, arguments);
    }

    Collection.prototype.parse = function(resp, xhr) {
      var item, model_ns, ns, result, v, _len;
      ns = this.namespace;
      if (ns && assert_ns(resp, ns)) resp = resp[ns];
      model_ns = this.model.prototype.namespace;
      result = [];
      if (model_ns) {
        for (v = 0, _len = resp.length; v < _len; v++) {
          item = resp[v];
          assert_ns(item, model_ns);
          if (item[model_ns] !== null) result.push(item[model_ns]);
        }
      }
      return result;
    };

    Collection.prototype.toJSON = function() {
      return _.clone(this.attributes);
    };

    Collection.prototype.getAttributes = function() {
      return this.map(function(model) {
        return model.getAttributes();
      });
    };

    return Collection;

  })(backbone.Collection);

  pebblebone.Collection = Collection;

  pebblebone.VERSION += ".pebbles";

  methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read': 'GET'
  };

  getUrl = function(object) {
    if (!(object && object.url)) return null;
    if (_.isFunction(object.url)) {
      return object.url();
    } else {
      return object.url;
    }
  };

  pebblebone.sync = function(method, model, options) {
    var headers;
    headers = {};
    if (!options.data && model && (method === 'create' || method === 'update')) {
      headers['Content-Type'] = 'application/json';
      options.data = JSON.stringify(model.toJSON());
    }
    return pebblecore.connector.perform(methodMap[method], getUrl(model), options.data, headers).then(options.success, options.error);
  };

  if (typeof exports !== "undefined" && exports !== null) {
    _.extend(exports, pebblebone);
  } else {
    (this.pebbles || (this.pebbles = {})).backbone = pebblebone;
  }

}).call(this);

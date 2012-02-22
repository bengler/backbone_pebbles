

/* backbone_pebbles.js.coffee */

(function() {
  var assert_ns, backbone, getUrl, methodMap, pebblecore, _;

  pebblecore = require('pebblecore');

  _ = require('underscore');

  backbone = require('backbone');

  assert_ns = function(obj, ns) {
    if (!obj.hasOwnProperty(ns)) {
      throw new Error('Invalid namespace for collection ' + this.constructor.name + ': "' + ns + '" (missing key in response)');
    }
    return true;
  };

  _.extend(backbone.Model.prototype, {
    parse: function(resp, xhr) {
      var ns;
      ns = this.namespace;
      if (ns && assert_ns(resp, ns)) return resp[ns];
      return resp;
    },
    toJSON: function() {
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
    },
    getAttributes: function() {
      return _.clone(this.attributes);
    }
  });

  _.extend(backbone.Model.prototype, {
    parse: function(resp, xhr) {
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
    },
    toJSON: function() {
      return _.clone(this.attributes);
    },
    getAttributes: function() {
      return this.map(function(model) {
        return model.getAttributes();
      });
    }
  });

  backbone.VERSION += ".pebbles";

  getUrl = function(object) {
    if (!(object && object.url)) return null;
    if (_.isFunction(object.url)) {
      return object.url();
    } else {
      return object.url;
    }
  };

  methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read': 'GET'
  };

  backbone.sync = function(method, model, options) {
    var headers, promise;
    headers = {};
    if (!options.data && model && (method === 'create' || method === 'update')) {
      headers['Content-Type'] = 'application/json';
      options.data = JSON.stringify(model.toJSON());
    }
    promise = pebblecore.state.connector.perform(methodMap[method], getUrl(model), options.data, headers);
    promise.then(options.success, options.error);
    return promise;
  };

  module.exports = Backbone;

}).call(this);

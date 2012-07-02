pebblecore = require('pebblecore')
_ = require('underscore')
Backbone = require('backbone')

# TODO: This line is a hack because of a fluke in browserify that gives backbone_pebbles a separate
# pebblecore instance all to itself. When we have resolved that, this should go.
console.log("Warning: backbone_pebbles is connecting to pebbles on its own. Hack hack hack (backbone_pebbles.coffee:8)")
pebblecore.service.connect()

# Extend Backbone.Model to support setting a namespace
# for models. Example response from server:
#
#   'modelname' :
#     ... attributes ...
#
# We dont want the attributes to be scoped by the model name
# in the models attributes property. This new parse function
# will drop the namespace if it is defined on the model.
# Example:
#
# SomeModel = Backbone.Model.extend(
#   namespace : 'someModel'
# )

# Will throw an error unless a given object has the given key
assert_ns = (obj, ns) ->
  if !obj.hasOwnProperty(ns)
    throw new Error('Invalid namespace for collection '+@constructor.name+': "'+ns+'" (missing key in response)')
  true

# Extend Backbone.Collection to support setting a namespace
# for the collection and its models. Example response from server:
#
#   'models' : [
#    'model' :
#     ... attributes ...
#   ]
#
# We dont want the attributes to be scoped by the models root
# This new parse function will drop the namespace
# if it is defined on the collection. Example:
#
# SomeCollection = Backbone.Collection.extend(
#   namespace : 'myModels'
# )

_.extend Backbone.Model.prototype,
  parse: (resp, xhr) ->
    ns = @namespace
    return resp[ns] if (ns && assert_ns(resp, ns))
    resp

  toJSON: () ->
    ns = @namespace
    attrs = _.clone(@attributes)
    if (ns)
      result = {}
      result[ns] = attrs
      result
    else
      attrs

  # Returns a munge-safe duplicate hash of the models attributes
  getAttributes: () ->
    _.clone @attributes



_.extend Backbone.Collection.prototype,
  parse : (resp, xhr) ->
    ns = @namespace
    if ns && assert_ns(resp, ns)
      resp = resp[ns]

    model_ns = @model.prototype.namespace
    result = []
    if model_ns
      for item, v in resp
        assert_ns(item, model_ns)
        result.push item[model_ns] unless item[model_ns] == null

    result

  # Returns a munge-safe duplicate hash of the models attributes
  toJSON: () ->
    return _.clone(@attributes)

  # Returns a munge-safe duplicate hash of the models attributes
  getAttributes: () ->
    @map (model) ->
      model.getAttributes()

Backbone.VERSION += ".pebbles"


# Backbone.sync
# -------------

# Overrides Backbone.sync to use the Pebbles connector for all
# sync. This ensures that components may transparently work also as guests on
# non-pebble domains through EasyXDM.

getUrl = (object) ->
  return null if (!(object && object.url))
  if _.isFunction(object.url)
    object.url()
  else
    object.url

# Map from CRUD to HTTP
methodMap =
  'create': 'POST',
  'update': 'PUT',
  'delete': 'DELETE'
  'read'  : 'GET'

Backbone.sync = (method, model, options) ->
  headers = {}
  # Ensure that we have the appropriate request data.
  if !options.data and model and (method is 'create' or method is 'update')
    headers['Content-Type'] = 'application/json'
    options.data = JSON.stringify(model.toJSON())
  promise = pebblecore.service.state.connector.perform(methodMap[method],
    getUrl(model), options.data, headers)
  promise.then(options.success, options.error)
  promise

module.exports = Backbone
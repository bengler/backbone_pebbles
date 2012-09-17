$ = require('jquery')
_ = require('underscore')
should = require('should')

Backbone = require('backbone')

original_version = Backbone.VERSION

require('../index')

describe "Backbone Pebbles", ->
  it "adds a modifier to the version field", ->
    Backbone.VERSION.should.equal(original_version+".pebbles")

  it "parses models respecting namespace", ->
    class Namespaced extends Backbone.Model
      namespace: "namespace"
    n = new Namespaced({})
    # setting the result from parse simulates fetching via ajax
    n.set(n.parse({namespace: {key:"value"}}))
    n.get("key").should.equal('value')

  it "gets the id attribute from within the namespace", ->
    class Namespaced extends Backbone.Model
      namespace: "namespace"
      idAttribute: "uid"
    n = new Namespaced({})
    n.set(n.parse({namespace: {key:"value", uid:"post:a.b$1"}}))
    n.id.should.equal("post:a.b$1")


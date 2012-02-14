$ = require('jquery')
_ = require('underscore')

backbone = require('backbone')

original_version = backbone.VERSION

require('../backbone_pebbles')

describe "Backbone Pebbles", ->
  it "adds a modifier to the version field", -> 
    backbone.VERSION.should.equal(original_version+".pebbles")

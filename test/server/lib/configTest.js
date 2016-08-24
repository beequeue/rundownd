
var assert = require("assert"),
	  config = require("../../../src/server/lib/config");

describe('lib/config', function(){

  describe('load', function(){

  	it('should return correct config object from file', function() {
  	  var expected = {
  		"a": 123,
  		"b": {
    	  "c": 456
  		}
	  };
	  assert.deepEqual(config.load(__dirname + '/../../_fixtures/config.js'), expected);
  	});

  });

  describe('getDefaults', function(){

  	var defaults = config.getDefaults();

    it('should return a default port', function(){
      assert.equal(defaults.port, 3000);
    });

  });

});

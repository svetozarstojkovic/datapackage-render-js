var assert = require('assert')
  , spec = require('../index.js')
  ;

var dp1 = {
  "name": "abc",
  "resources": [
    {
      "name": "random",
      "format": "csv",
      "path": "test/data/dp1/data.csv"
    }
  ],
  "views": [
    {
      "type": "vegalite",
      "spec": {
        "data": {
          "resource": "random"
        },
        "mark": "bar",
        "encoding": {
          "x": {"field": "name", "type": "ordinal"},
          "y": {"field": "size", "type": "quantitative"}
        }
      }
    }
  ]
};

describe('html', function() {
  it('html renders ok', function(done) {
    spec.html('test/data/dp1', function(error, html) {
      assert(!error);
      assert.equal(html.slice(0, 20), '<div class="dataset ');
      done();
    });
  });
});

describe('renderView', function() {
  it('works ok', function(done) {
    var dp = new spec.DataPackage(dp1);
    var viewId = 0;
    spec.renderView(dp, viewId)
      .then(function(vegaView) {
        vegaView.renderer('canvas').update();
        var stream = vegaView.canvas().createPNGStream();
        var output = [];
        stream.on('data', function(chunk) {
          output.push(chunk);
        });
        stream.on('end', function() {
          // very hacky test ...
          assert.equal(output[output.length-1][0], 174);
          done();
        });
      });
  });
});

describe('DataPackage', function() {
  it('instantiates', function() {
    var dp = new spec.DataPackage();
  });

  it('instantiates with string', function() {
    var dp = new spec.DataPackage('abc');
    assert.equal(dp.path, 'abc');
  });
  
  it('instantiates with object', function() {
    var dp = new spec.DataPackage(dp1);
    assert.deepEqual(dp.data, dp1);
  });

  it('loads', function(done) {
    var dp = new spec.DataPackage('test/data/dp1');
    dp.load()
      .then(function() {
        assert.equal(dp.data.name, 'abc');
        assert.equal(dp.resources.length, 1);
        assert.equal(dp.resources[0].fullPath(), 'test/data/dp1/data.csv');
        done();
      });
  });

});

describe('Resource', function() {
  var resource = {
    "path": "test/data/dp1/data.csv"
  }
  it('instantiates', function() {
    var res = new spec.Resource(resource);
    assert.equal(res.data, resource);
    assert.equal(res.base, '');
  });
  it('fullPath works', function() {
    var res = new spec.Resource(resource, 'abc');
    assert.equal(res.base, 'abc');
    assert.equal(res.fullPath(), 'abc/test/data/dp1/data.csv');
  });
  it('objects works', function(done) {
    var res = new spec.Resource(resource);
    res.objects()
      .then(function(output) {
        assert.equal(output.length, 3);
        assert.equal(output[0].size, "100");
        done();
      });
  });
  it('stream works', function(done) {
    var res = new spec.Resource(resource);
    spec.objectStreamToArray(res.stream()).
      then(function(output) { 
        assert.equal(output.length, 3);
        assert.equal(output[0].size, "100");
        done();
      });
  });
});


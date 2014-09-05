
/*
  Simplistic Controller for express with promises

  Controller.before = function (req, res, next, action) {
    next(); // Must call next() or next(error) at some point;
  }

  Controller.show = function (req, res) {
    res.render(...)
      or
    return res.render(...) // If you work with render promises
  }
*/

var Q = require('q');

var Controller = function (name) {
  this.name = name || "No name";
  this.ACTIONS = ['list', 'show', 'index', 'form', 'edit', 'create', 'update', 'remove'];
};

var Constructor = function (name) {
  return new Controller(name);
};

var noop = function (req, res) { if (res.end) res.end('Not implemented yet'); else console.log(this, 'Not implemented yet'); };

Controller.prototype.before = function (req, res, next, action) { next(); };
Controller.prototype.list = Controller.prototype.index = noop; //# GET /
Controller.prototype.show = noop;   //# GET /:id
Controller.prototype.form = noop;   //# GET /new
Controller.prototype.edit = noop;   //# GET /:id/edit
Controller.prototype.create = noop; //# POST /
Controller.prototype.update = noop; //# PUT /:id
Controller.prototype.remove = noop; //# DELETE /:id

/*
  Wrap the known ACTIONS in an object so that direct access to them uses before callback and properly sets _this_
*/
Controller.prototype.wrap = function () {
  var self = this;
  var obj = {
    action: function () {} // Disabled!
    , name: 'Wrapped' + self.name
  };
  this.ACTIONS.forEach(function (method) {
    if (self[method]) 
      obj[method] = function (req, res) {
        var promise = self.action.call(self, method)(req, res);
        return promise.then(function (value) {
          // console.log('[Controller]', self.name + '.' + method, 'RESOLVED', value.length);
          return value;
        }).fail(function (err) {
          // console.log('[Controller]', self.name + '.' + method, 'FAILED', err, err.stack);
          throw err;
        });
      }
      obj[method]._name = self.name + '.' + method;
  });
  obj.__proto__ = this;
  return obj;  
}

/*
  return a ready to use action with before callback and properly set _this_
  Only for not wrapped objects. Wrapped objects already include it for every ACTIONS

  Ex:
    app.get('/foo', FooController.action('list')); //#=> calls FooController.before and then FooController.list

    It is the same as:
    var fooController = FooController.wrap();
    app.get('/foo', fooController.list);

    It is NOT the same as:
    app.get('/foo', FooController.list); // Which doesn't run the "before" sequence

*/
Controller.prototype.action = function (method) {
  var self = this;
  
  if (this.before) {
    var deferred = Q.defer();
    
    return function (req, res) {
      try {
        
        // console.log('[Controller before]', self.name + '.' + method);
        self.before.call(self, req, res, function (err) {
          if (err) return deferred.reject(err);
          else deferred.resolve();
        }, method); 
        
      } catch (e) {
        deferred.reject(e);
      }
    
      return deferred.promise.then(function () {
        // console.log('[Controller]', self.name + '.' + method);
        return self[method].call(self, req, res);
      });
      
    }
  }
  
  return function (req, res) { 
    // console.log('[Controller]', self.name + '.' + method);
    return self[method].call(self, req, res); 
  };
};

module.exports = Constructor;
module.exports.Prototype = Controller;

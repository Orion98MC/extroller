
/*
  Simplistic Controller for express

  * Simple usage:

  var FooController = Controller();
  FooController.list = function (req, res) { res.render('foo/index'); }

  app.get('/foo', Controller.list);

  * Advanced usage:
  var FooController = Controller();
  FooController.list = function (req, res) { 
    res.render('foo/index'); 
  }
  FooController.before = function (req, res, next, action) {
    res.locals.foos = this.findFoos();
  }
  
  var fooController = FooController.wrap();

  app.get('/foo', fooController.list);
  
*/

var Controller = function () {};
var Constructor = function (name) {
  var obj = new Controller();
  obj.name = name || "No name";
  return obj;
};

var noop = function (req, res) { if (res.end) res.end('Not implemented yet'); else console.log(this, 'Not implemented yet'); };

Controller.prototype.before = function (req, res, next, method) { return next(); };
Controller.prototype.list = Controller.prototype.index = noop; //# GET /
Controller.prototype.show = noop;   //# GET /:id
Controller.prototype.form = noop;   //# GET /new
Controller.prototype.edit = noop;   //# GET /:id/edit
Controller.prototype.create = noop; //# POST /
Controller.prototype.update = noop; //# PUT /:id
Controller.prototype.remove = noop; //# DELETE /:id

/*
  Wrap the known METHODs in an action so that direct access to them uses before callback and properly sets _this_
*/
Controller.prototype.wrap = function () {
  var obj = {
    action: function () {} // Disabled!
  }, self = this;
  this.METHODS.forEach(function (method) {
    if (self[method]) 
      obj[method] = function (req, res) {
        self.action.call(self, method)(req, res);
      }
  });
  obj.__proto__ = this;
  return obj;  
}

/*
  return a ready to use action with before callback and properly set _this_
  Only for not wrapped objects. Wrapped objects already include it for every METHOD

  Ex:
    app.get('/foo', FooController.action('list')); //#=> calls FooController.before and then FooController.list

    It is the same as:
    app.get('/foo', fooController.list);

    It is NOT the same as:
    app.get('/foo', FooController.list); // Which doesn't run the before callback

*/
Controller.prototype.action = function (method) {
  var self = this;
  
  if (this.before) {
    return function (req, res) { 
      self.before.call(self, req, res, function () { 
        self[method].call(self, req, res); 
      }, method); 
    };
  }
  
  return function (req, res) { 
    self[method].call(self, req, res);
  };
};

Controller.prototype.METHODS = ['list', 'show', 'index', 'form', 'edit', 'create', 'update', 'remove'];

module.exports = Constructor;
module.exports.Prototype = Controller;

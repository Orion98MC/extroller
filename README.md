# Express Simplistic Controller

Adds a very little controller object definition to express.

* Easy to use
* very few conventions

## Example Usage:

Basic usage:

```js
var FooController = Controller();

FooController.list = function (req, res) { res.render('foo/index'); }

FooController.before = function (req, res, next, action) {
  res.locals.foos = this.model.all();
}

FooController.model = Foo;

app.get('/badfoo', FooController.list);         // <- No "before" called
app.get('/foo', FooController.action('list));   // <- "before" is called ;)
```

Advanced usage:

```js
var FooController = Controller('I am FooController');

FooController.list = function (req, res) { 
  res.render('foo/index'); 
}

FooController.show = function (req, res) { 
  res.render('foo/show'); 
}

FooController.before = function (req, res, next, action) {
  if (action === 'list') res.locals.foos = this.model.all();
  if (req.param('foo_id')) res.locals.foo = this.model.findById(req.param('foo_id'));
}

FooController.model = Foo;

var fooController = FooController.wrap(); // <- Wraps the controller's actions

app.get('/foos', fooController.list);
app.get('/foo', fooController.show);
```

## API

* Controller(name)

Creates a new controller and sets its name

* controller.before

A function that is called every time an action is called. It is passed (req, res, next, action_name).

* controller.action(action_name)

Calls the action of the controller after having called the "before" function

* controller.wrap()

Wraps the controller actions so that 'before' is called and properly set _this_

* controller.ACTIONS

The defined actions which are targetted upon wrap()




## License terms

Copyright (c), 2014 Thierry Passeron

The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
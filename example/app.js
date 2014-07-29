var 
  express = require('express')
  atpl = require('atpl') // Twig for nodejs
  Controller = require('../index')  

var app = express();

// Extend res.render
require('extrender')(app, { layout: '_layout.html' });

app.engine('html', atpl.__express);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');


// Controller
var FooController = Controller();
FooController.list = function (req, res) {
  console.log('List in Foo', req.param('id'));
  res.render('foo');
};


var BarController = Controller();
BarController.list = function (req, res) {
  console.log('List in Bar', req.param('id'));
  res.render('bar');
};
BarController.before = function (req, res, next, method) {
  console.log('Bar Before', method, req.param('id'));
  next();
};

app.use(function (req, res, next) {
  res.locals.layout = 'layout.html';
  res.locals.ident = "Global";
  next();
});

var foo = FooController.wrap();
var bar = BarController.wrap();

app.get('/foo', foo.list);
app.get('/bar', bar.list);

app.get('/foobar', function (req, res) {
  res.render(foo.list, { ident: 'Foo partial' }).then(function (str) {
    return res.render(bar.list, { foo: str, _body: { id: 12345 } });
  }).then(function (str) {
    res.render('layout', { partial: str });
  }).done();
});

app.listen(3000);

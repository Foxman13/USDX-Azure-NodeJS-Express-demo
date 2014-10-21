
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var emails = require('./routes/emails');
var http = require('http');
var path = require('path');
var nconf = require("nconf");

// Create nconf environtment
nconf
    .file({ file: 'config.json' })
    .env();
var demo_password = nconf.get("DEMO_PASSWORD");

var auth = express.basicAuth(function (username, password, callback) {
    var result = ((username === 'microsoft') && (password === demo_password));
    callback(null, result);
});


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/', routes.createItem);
app.get('/list-emails', auth, emails.list);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

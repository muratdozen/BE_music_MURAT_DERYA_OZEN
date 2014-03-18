/**
 * Module dependencies.
 */

var express = require('express');
var url = require('./url.js');
var appStartupHelper = require('./app-startup-helper.js');

var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('musics json file path', __dirname + '/public/json/musics.json');
app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// configure routes and urls for all endpoints
url.configureRoutes(app);

// load musics json file into musicStore
appStartupHelper.loadMusicsJsonFile(app.get('musics json file path'));

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
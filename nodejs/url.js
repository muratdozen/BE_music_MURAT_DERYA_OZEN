var routes = require('./routes');
var user = require('./routes/user');

exports.configureRoutes = function (app) {
    app.get('/', routes.index);
    app.post('/follow', user.follow);
    app.post('/listen', user.listen);
    app.get('/recommendations', user.recommendations);
}
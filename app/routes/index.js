const factoryRoutes = require('./factory_routes');

module.exports = function (app, db){
	factoryRoutes(app, db);
}
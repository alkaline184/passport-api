const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const db = require('./config/db');
const port = 8000;

const app = express();
//Node JS can't process URLEncoded parameters on its own - thats why we use the bodyParser library
app.use(bodyParser.urlencoded({extended: true}));


MongoClient.connect(db.url, function(err, database){
	if (err) return console.log(err);
	require('./app/routes/')(app, database);

	app.listen(port, function(){
		console.log('Express servers started. Running on ' + port + ' port.');
	});
});

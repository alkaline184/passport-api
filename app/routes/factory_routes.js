var ObjectID = require('mongodb').ObjectID;

function isPositiveInteger(str) {
    var n = Math.floor(Number(str));
    return String(n) === str && n >= 0;
}

function randomIntegerInInterval(lower,upper){
    return Math.floor(Math.random()*(upper-lower+1))+lower;
}

module.exports = function(app, db){
	
	//Updates factory. All the valid values that are sent to the function will be updated. Children will be preserved
	app.put('/factories/:id', function(req, res){
		var nameParam = req.body.name;
		var lowerParam = req.body.lower;
		var upperParam = req.body.upper;
		var childCount = req.body.count;

		const id = req.params.id;
		const details = {'_id': new ObjectID(id)};
		const factory = {name: nameParam, lower: lowerParam, upper: upperParam, count: childCount };
		//First check if the document exists
		db.collection('factories').findOne(details, function(err, item){
			if(err){
				res.status(500).send({'Server Error': 'Server error has occured'});		
			} else {
				if (item){
					//Need to preserve children while updating
					if (item.children){
						factory.children = item.children;
					}
					//If the document exists, then update it
					if (!nameParam.trim()){ //If factory name is empty
						res.status(400).send({'Bad Request': 'Factory name can\'t be blank'});
					} else if (!isPositiveInteger(lowerParam)) { //If lower is not an integer
						res.status(400).send({'Bad Request': 'Lower Range should be a Positive Integer'});
					} else if (!isPositiveInteger(upperParam)) { //If upper is not an integer
						res.status(400).send({'Bad Request': 'Upper Range should be a Positive Integer'});
					} else if (!isPositiveInteger(childCount) || childCount > 15) { //If childCount is not an integer or greater than 15
						res.status(400).send({'Bad Request': 'Child Count should be a Positive Integer not greater than 15'});
					} else if (parseInt(upperParam) <= parseInt(lowerParam)) { //If upper is lower than lower
						res.status(400).send({'Bad Request': 'Upper Range should be greater than Lower Range'});
					} else {
						db.collection('factories').update(details, factory, function(errUp, result){
							if(errUp){
								res.status(500).send({'Server Error': 'Server error has occured'});		
							} else {
								res.send(factory);
							}
						});
					}
				} else {
					res.status(400).send({'Bad Request': 'Specified factory doesn\'t exist'});
				}
			}
		});	
	});

	//Deletes factory with specified _id
	app.delete('/factories/:id', function(req, res){
		const id = req.params.id;
		const details = {'_id': new ObjectID(id)};

		//First check if the document exists
		db.collection('factories').findOne(details, function(err, item){
			if(err){
				res.status(500).send({'Server Error': 'Server error has occured'});		
			} else {
				if (item){
					//If the document exists, then delete it
					db.collection('factories').remove(details, function(errDel, itemDel){
						if(errDel){
							res.status(500).send({'Server Error': 'Server error has occured'});	
						} else {
							res.status(200).send('Factory '+ id + ' deleted');
						}
					});
				} else {
					res.status(400).send({'Bad Request': 'Specified factory doesn\'t exist'});
				}
			}
		});
	});

	//Fetch single factory
	app.get('/factories/:id', function(req, res){
		const id = req.params.id;
		const details = {'_id': new ObjectID(id)};
		db.collection('factories').findOne(details, function(err, item){
			if(err){
				res.status(500).send({'Server Error': 'Server error has occured'});	
			} else {
				if (item){
					res.status(200).send(item);
				} else {
					res.status(400).send({'Bad Request': 'Specified factory doesn\'t exist'});
				}
			}
		});
	});

	//Fetches all the factory documents from the database
	app.get('/factories/', function(req, res){
		const id = req.params.id;
		const details = {'_id': new ObjectID(id)};
		db.collection('factories').find().toArray(function(err, items){
			if(err){
				res.status(500).send({'Server Error': 'Server error has occured'});		
			} else {
				res.status(200).send(items);
			}
		});
	});

	//Creates factories with specified parameters
	app.post('/factories', function(req, res){
		var nameParam = req.body.name;
		var lowerParam = req.body.lower;
		var upperParam = req.body.upper;
		var childCount = req.body.count;

		if (!nameParam.trim()){ //If factory name is empty
			res.status(400).send({'Bad Request': 'Factory name can\'t be blank'});
		} else if (!isPositiveInteger(lowerParam)) { //If lower is not an integer
			res.status(400).send({'Bad Request': 'Lower Range should be a Positive Integer'});
		} else if (!isPositiveInteger(upperParam)) { //If upper is not an integer
			res.status(400).send({'Bad Request': 'Upper Range should be a Positive Integer'});
		} else if (!isPositiveInteger(childCount) || childCount > 15) { //If childCount is not an integer or greater than 15
			res.status(400).send({'Bad Request': 'Child Count should be a Positive Integer not greater than 15'});
		} else if (parseInt(upperParam) <= parseInt(lowerParam)) { //If upper is lower than lower
			res.status(400).send({'Bad Request': 'Upper Range should be greater than Lower Range'});
		} else {
			const factory = {name: nameParam, lower: lowerParam, upper: upperParam, count: childCount, children: '[]'};
			db.collection('factories').insert(factory,function(err, result){
				if(err){
					res.status(500).send({'Server Error': 'Server error has occured'});	
				} else {
					res.status(200).send(result.ops[0]);
				}
			});
		}
	});

	//Adds new children to the factory and removes the old ones
	app.put('/factories/:id/children', function(req, res){
		const id = req.params.id;
		const details = {'_id': new ObjectID(id)};

		db.collection('factories').findOne(details, function(err, item){
			if(err){
				res.status(500).send({'Server Error': 'Server error has occured'});	
			} else {
				if (item){
					var arr = [];
					for (var i=0; i<item.count; i++) {
						arr.push(randomIntegerInInterval(parseInt(item.lower), parseInt(item.upper)));
					}
					item.children = arr;
					db.collection('factories').update(details, item, function(errUp, result){
						if(errUp){
							res.status(500).send({'Server Error': 'Server error has occured'});	
						} else {
							res.status(200).send(item);
						}
					});
				} else {
					res.status(400).send({'Bad Request': 'Specified factory doesn\'t exist'});
				}
			}
		});
		
	});

};

var fs = require("fs");
// var file = fs.readFileSync("../html.txt", "utf8");


// var striptags = require('striptags');

// var clean = striptags(file.replace(/\n|\r/g, "").replace(/\s\s+/g,"").replace(/Attachments:.*?Flag/g,""));
// var clean = striptags(file);
// fs.writeFileSync('semi-clean.txt', clean);
// var clean = fs.readFileSync("semi-clean.txt", "utf8");

/*var AlchemyAPI = require('./alchemyapi');
var alchemyapi = new AlchemyAPI();
var clean = fs.readFileSync('../clean.txt', "utf8");
var chunksize = 49000;
var stop = clean.length;
var offset = 0;
var res = [];

for (var i = offset; i < parseInt((stop-offset)/chunksize); i++) {
	chunk = clean.slice(offset+i*chunksize,offset+(i+1)*chunksize);
	console.log("getting "+(offset+i*chunksize)+" to "+(offset+(i+1)*chunksize));
	alchemyapi.entities('text', chunk, {'sentiment':1}, function(response) {
		console.log(response);
		res.push(response.entities);
		console.log(oreqs);
		finish();
	});
}*/

var res = JSON.parse(fs.readFileSync('sent-semi-clean.json', "utf8"));

var oreqs = 1//parseInt((stop-offset)/chunksize);

function validateText(text) {
	var bad = [
		'Inappropriate',
		'plain text',
		'Careers',
		'Zombie',
		'stdout',
		'Stephen',
		'standard',
	];
	var reject = false;
	for (s of bad) {
		if (text.indexOf(s) != -1) {
			reject = true;
		}
	}
	return reject;
}

function collate(arr) {
	for (entity of arr) {
		shouldInsert = true;
		for (e of entities) {
			if (e.text == entity.text || validateText(entity.text)) {
				shouldInsert = false;
			}
		}
		if (shouldInsert) {
			entities.push(entity);
		}
	}
	return 1
}

entities = [];

function compare(a,b) {
  if (a.relevance < b.relevance)
    return -1;
  else if (a.relevance > b.relevance)
    return 1;
  else 
    return 0;
}

function filterData(array) {
	ret = array.slice(array.length-33,array.length);
	for (item of array) {
		if (item.text.indexOf("mp") != -1) {
			ret.push(item);
		}
		if (item.text.indexOf("MP") != -1) {
			ret.push(item);
		}
		if (item.text.indexOf("Mp") != -1) {
			ret.push(item);
		}
	}
	return ret;
}

function finish() {
	if (--oreqs == 0) {
		res.reduce(function (prev,cur,i,arr) {
			return collate(arr[i]);
		});
		final_ret = []
		filterData(entities.sort(compare)).map(function (entity) {
			final_ret.push({
				'subject': entity.text,
				'sentiment': entity.sentiment.type,
				'strength': entity.sentiment.score
			});
		});
		fs.writeFileSync('data.json', JSON.stringify(final_ret));
	}
}

finish();
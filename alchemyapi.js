var request = require('request');
var fs = require('fs');

var ENDPOINTS = {};
var BASE_URL = 'http://access.alchemyapi.com/calls';
var API_KEY = '';

//Check if file was called directly
if (require.main === module) {
	//file was called directly from command line to set the key
	if (process.argv[2]) {
		console.log('Args: ' + process.argv[2]);
		fs.writeFile(__dirname + '/api_key.txt',process.argv[2], function(err) {
			if (err) {
				console.log('Error, unable to write key file: ' + err);
			} else {
				console.log('AlchemyAPI key: ' + process.argv[2] + ' successfully written to api_key.txt');
			}
			process.exit(0);
		});
	}
}


function init() {
	//Setup the endpoints
	ENDPOINTS['sentiment'] = {};
	ENDPOINTS['sentiment']['url'] = '/url/URLGetTextSentiment';
	ENDPOINTS['sentiment']['text'] = '/text/TextGetTextSentiment';
	ENDPOINTS['sentiment']['html'] = '/html/HTMLGetTextSentiment';
	ENDPOINTS['sentiment_targeted'] = {};
	ENDPOINTS['sentiment_targeted']['url'] = '/url/URLGetTargetedSentiment';
	ENDPOINTS['sentiment_targeted']['text'] = '/text/TextGetTargetedSentiment';
	ENDPOINTS['sentiment_targeted']['html'] = '/html/HTMLGetTargetedSentiment';
	ENDPOINTS['author'] = {};
	ENDPOINTS['author']['url'] = '/url/URLGetAuthor';
	ENDPOINTS['author']['html'] = '/html/HTMLGetAuthor';
	ENDPOINTS['keywords'] = {};
	ENDPOINTS['keywords']['url'] = '/url/URLGetRankedKeywords';
	ENDPOINTS['keywords']['text'] = '/text/TextGetRankedKeywords';
	ENDPOINTS['keywords']['html'] = '/html/HTMLGetRankedKeywords';
	ENDPOINTS['concepts'] = {};
	ENDPOINTS['concepts']['url'] = '/url/URLGetRankedConcepts';
	ENDPOINTS['concepts']['text'] = '/text/TextGetRankedConcepts';
	ENDPOINTS['concepts']['html'] = '/html/HTMLGetRankedConcepts';
	ENDPOINTS['entities'] = {};
	ENDPOINTS['entities']['url'] = '/url/URLGetRankedNamedEntities';
	ENDPOINTS['entities']['text'] = '/text/TextGetRankedNamedEntities';
	ENDPOINTS['entities']['html'] = '/html/HTMLGetRankedNamedEntities';
	ENDPOINTS['category'] = {};
	ENDPOINTS['category']['url']  = '/url/URLGetCategory';
	ENDPOINTS['category']['text'] = '/text/TextGetCategory';
	ENDPOINTS['category']['html'] = '/html/HTMLGetCategory';
	ENDPOINTS['relations'] = {};
	ENDPOINTS['relations']['url']  = '/url/URLGetRelations';
	ENDPOINTS['relations']['text'] = '/text/TextGetRelations';
	ENDPOINTS['relations']['html'] = '/html/HTMLGetRelations';
	ENDPOINTS['language'] = {};
	ENDPOINTS['language']['url']  = '/url/URLGetLanguage';
	ENDPOINTS['language']['text'] = '/text/TextGetLanguage';
	ENDPOINTS['language']['html'] = '/html/HTMLGetLanguage';
	ENDPOINTS['text_clean'] = {};
	ENDPOINTS['text_clean']['url']  = '/url/URLGetText';
	ENDPOINTS['text_clean']['html'] = '/html/HTMLGetText';
	ENDPOINTS['text_raw'] = {};
	ENDPOINTS['text_raw']['url']  = '/url/URLGetRawText';
	ENDPOINTS['text_raw']['html'] = '/html/HTMLGetRawText';
	ENDPOINTS['text_title'] = {};
	ENDPOINTS['text_title']['url']  = '/url/URLGetTitle';
	ENDPOINTS['text_title']['html'] = '/html/HTMLGetTitle';
	ENDPOINTS['feeds'] = {};
	ENDPOINTS['feeds']['url']  = '/url/URLGetFeedLinks';
	ENDPOINTS['feeds']['html'] = '/html/HTMLGetFeedLinks';
	ENDPOINTS['microformats'] = {};
	ENDPOINTS['microformats']['url']  = '/url/URLGetMicroformatData';
	ENDPOINTS['microformats']['html'] = '/html/HTMLGetMicroformatData';


	//Load the key from api_key.txt
	try {
		key = fs.readFileSync(__dirname + '/api_key.txt').toString().trim();
	}
	catch(err) {
		//Create the file
		fs.openSync(__dirname + '/api_key.txt', 'w');
		console.log('API key not detected in api_key.txt, please copy/paste your key into this file.');
		console.log('If you do not have a key, register for one at: http://www.alchemyapi.com/api/register.html');
		process.exit(1);
	}
	
	//Make sure the key formating looks good
	if (key.length != 40) {
		console.log('The API key in api_key.txt does not appear to be valid. Make sure to copy/paste the key correctly into api_key.txt, and that the file only contains the key.');
		console.log('If you do not have a key, register for one at: http://www.alchemyapi.com/api/register.html');
		process.exit(1);
	}

	//Set the key
	API_KEY = key;
}


exports.sentiment = function(flavor, data, callback) {
	
	if (API_KEY == '') {
		init();
	}

	if (!(flavor in ENDPOINTS['sentiment'])) {
		callback({ status:'ERROR', statusInfo:'Sentiment analysis is not available for ' + flavor });
	} else {
		var url = BASE_URL +
					ENDPOINTS['sentiment'][flavor] +
					'?apikey=' + API_KEY +
					'&' + flavor + '=' + encodeURIComponent(data) +
					'&outputMode=json';

		analyze(url, callback);
	}
};



exports.sentiment_targeted = function(flavor, data, target, callback) {
	if (API_KEY == '') {
		init();
	}
	
	if (!(flavor in ENDPOINTS['sentiment_targeted'])) {
		callback({ status:'ERROR', statusInfo:'Sentiment analysis is not available for ' + flavor });
	} else if (!target) {
		callback({ status:'ERROR', statusInfo:'target must not be null' }); 
	} else {
		var url = BASE_URL +
					ENDPOINTS['sentiment_targeted'][flavor] +
					'?apikey=' + API_KEY +
					'&' + flavor + '=' + encodeURIComponent(data) +
					'&outputMode=json';

		analyze(url, callback);
	}
};



exports.entities = function(flavor, data, callback) {
	if (API_KEY == '') {
		init();
	}

	if (!(flavor in ENDPOINTS['entities'])) {
		callback({ status:'ERROR', statusInfo:'Entity extraction is not available for ' + flavor });
	} else {
		var url = BASE_URL +
					ENDPOINTS['entities'][flavor] +
					'?apikey=' + API_KEY +
					'&' + flavor + '=' + encodeURIComponent(data) +
					'&outputMode=json';

		analyze(url, callback);
	}
};



exports.keywords = function(flavor, data, callback) {
	if (API_KEY == '') {
		init();
	}

	if (!(flavor in ENDPOINTS['keywords'])) {
		callback({ status:'ERROR', statusInfo:'Keyword extraction is not available for ' + flavor });
	} else {
		var url = BASE_URL +
					ENDPOINTS['keywords'][flavor] +
					'?apikey=' + API_KEY +
					'&' + flavor + '=' + encodeURIComponent(data) +
					'&outputMode=json';

		analyze(url, callback);
	}
};



exports.concepts = function(flavor, data, callback) {
	if (API_KEY == '') {
		init();
	}

	if (!(flavor in ENDPOINTS['concepts'])) {
		callback({ status:'ERROR', statusInfo:'Concept tagging is not available for ' + flavor });
	} else {
		var url = BASE_URL +
					ENDPOINTS['concepts'][flavor] +
					'?apikey=' + API_KEY +
					'&' + flavor + '=' + encodeURIComponent(data) +
					'&outputMode=json';

		analyze(url, callback);
	}
};



exports.author = function(flavor, data, callback) {
	if (API_KEY == '') {
		init();
	}

	if (!(flavor in ENDPOINTS['author'])) {
		callback({ status:'ERROR', statusInfo:'Author extraction is not available for ' + flavor });
	} else {
		var url = BASE_URL +
					ENDPOINTS['author'][flavor] +
					'?apikey=' + API_KEY +
					'&' + flavor + '=' + encodeURIComponent(data) +
					'&outputMode=json';

		analyze(url, callback);
	}
};



exports.category = function(flavor, data, callback) {
	if (API_KEY == '') {
		init();
	}

	if (!(flavor in ENDPOINTS['category'])) {
		callback({ status:'ERROR', statusInfo:'Text categorization is not available for ' + flavor });
	} else {
		var url = BASE_URL +
					ENDPOINTS['category'][flavor] +
					'?apikey=' + API_KEY +
					'&' + flavor + '=' + encodeURIComponent(data) +
					'&outputMode=json';

		analyze(url, callback);
	}
};



exports.relations = function(flavor, data, callback) {
	if (API_KEY == '') {
		init();
	}

	if (!(flavor in ENDPOINTS['relations'])) {
		callback({ status:'ERROR', statusInfo:'Relation extraction is not available for ' + flavor });
	} else {
		var url = BASE_URL +
					ENDPOINTS['relations'][flavor] +
					'?apikey=' + API_KEY +
					'&' + flavor + '=' + encodeURIComponent(data) +
					'&outputMode=json';

		analyze(url, callback);
	}
};



exports.language = function(flavor, data, callback) {
	if (API_KEY == '') {
		init();
	}

	if (!(flavor in ENDPOINTS['language'])) {
		callback({ status:'ERROR', statusInfo:'Language detection is not available for ' + flavor });
	} else {
		var url = BASE_URL +
					ENDPOINTS['language'][flavor] +
					'?apikey=' + API_KEY +
					'&' + flavor + '=' + encodeURIComponent(data) +
					'&outputMode=json';

		analyze(url, callback);
	}
};



exports.text_clean = function(flavor, data, callback) {
	if (API_KEY == '') {
		init();
	}

	if (!(flavor in ENDPOINTS['text_clean'])) {
		callback({ status:'ERROR', statusInfo:'Text extraction is not available for ' + flavor });
	} else {
		var url = BASE_URL +
					ENDPOINTS['text_clean'][flavor] +
					'?apikey=' + API_KEY +
					'&' + flavor + '=' + encodeURIComponent(data) +
					'&outputMode=json';

		analyze(url, callback);
	}
};



exports.text_raw = function(flavor, data, callback) {
	if (API_KEY == '') {
		init();
	}

	if (!(flavor in ENDPOINTS['text_raw'])) {
		callback({ status:'ERROR', statusInfo:'Text extraction is not available for ' + flavor });
	} else {
		var url = BASE_URL +
					ENDPOINTS['text_raw'][flavor] +
					'?apikey=' + API_KEY +
					'&' + flavor + '=' + encodeURIComponent(data) +
					'&outputMode=json';

		analyze(url, callback);
	}
};



exports.text_title = function(flavor, data, callback) {
	if (API_KEY == '') {
		init();
	}

	if (!(flavor in ENDPOINTS['text_title'])) {
		callback({ status:'ERROR', statusInfo:'Text extraction is not available for ' + flavor });
	} else {
		var url = BASE_URL +
					ENDPOINTS['text_title'][flavor] +
					'?apikey=' + API_KEY +
					'&' + flavor + '=' + encodeURIComponent(data) +
					'&outputMode=json';

		analyze(url, callback);
	}
};



exports.microformats = function(flavor, data, callback) {
	if (API_KEY == '') {
		init();
	}

	if (!(flavor in ENDPOINTS['microformats'])) {
		callback({ status:'ERROR', statusInfo:'Microformats parsing is not available for ' + flavor });
	} else {
		var url = BASE_URL +
					ENDPOINTS['microformats'][flavor] +
					'?apikey=' + API_KEY +
					'&' + flavor + '=' + encodeURIComponent(data) +
					'&outputMode=json';

		analyze(url, callback);
	}
};



exports.feeds = function(flavor, data, callback) {
	if (API_KEY == '') {
		init();
	}

	if (!(flavor in ENDPOINTS['feeds'])) {
		callback({ status:'ERROR', statusInfo:'Feed detection is not available for ' + flavor });
	} else {
		var url = BASE_URL +
					ENDPOINTS['feeds'][flavor] +
					'?apikey=' + API_KEY +
					'&' + flavor + '=' + encodeURIComponent(data) +
					'&outputMode=json';

		analyze(url, callback);
	}
};



function analyze(url, callback) {
	request.post({ url:url }, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			callback(error,JSON.parse(body));
		} else {
			callback(error,{ status:'ERROR', statusInfo:'invalid-server-response' });
		}
	});
}




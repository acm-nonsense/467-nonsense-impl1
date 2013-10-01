var request = require('request');
var fs = require('fs');

var ENDPOINTS = {};
var BASE_URL = 'http://access.alchemyapi.com/calls';
var API_KEY = '';

/** 
  * Checks if file is called directly, and then writes the API key to api_key.txt if it's included in the args 
  *
  * Note: if you don't have an API key, register for one at: http://www.alchemyapi.com/api/register.html
  *
  * INPUT:
  * Your API Key (sent as a command line argument)
  *
  * OUTPUT:
  * none
*/  
if (require.main === module) {
	//file was called directly from command line to set the key
	if (process.argv[2]) {
		console.log('Args: ' + process.argv[2]);
		fs.writeFile(__dirname + '/api_key.txt',process.argv[2], function(err) {
			if (err) {
				console.log('Error, unable to write key file: ' + err);
				process.exit(1);
			} else {
				console.log('AlchemyAPI key: ' + process.argv[2] + ' successfully written to api_key.txt');
				process.exit(0);
			}
		});
	} else {
		console.log('Are you trying to set the key? Make sure to use: node alchemyapi.js YOUR_KEY_HERE');
		process.exit(1);
	}
}


/** 
  *	Initializes the SDK so it can send requests to AlchemyAPI for analysis.
  *	It loads the API key from api_key.txt and configures the endpoints.
  *	This function will be called automatically from the endpoint wrappers when needed.
  *
  * Note: if you don't have an API key, register for one at: http://www.alchemyapi.com/api/register.html
  *
  * INPUT:
  * none
  *
  * OUTPUT:
  * none
*/  
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


/**
  *	Calculates the sentiment for text, a URL or HTML.
  *	For an overview, please refer to: http://www.alchemyapi.com/products/features/sentiment-analysis/
  *	For the docs, please refer to: http://www.alchemyapi.com/api/sentiment-analysis/
  *	
  *	INPUT:
  *	flavor -> which version of the call, i.e. text, url or html.
  *	data -> the data to analyze, either the text, the url or html code.
  *	options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  *	
  *	Available Options:
  *	showSourceText -> 0: disabled (default), 1: enabled
  *
  *	OUTPUT:
  *	The response, already converted from JSON to a Python object. 
*/
exports.sentiment = function(flavor, data, options, callback) {
	options = options || {}
	
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

		for (var key in options) {
			url += '&' + key + '=' + options[key].toString();
		}

		analyze(url, callback);
	}
};


/**
  *	Calculates the targeted sentiment for text, a URL or HTML.
  *	For an overview, please refer to: http://www.alchemyapi.com/products/features/sentiment-analysis/
  *	For the docs, please refer to: http://www.alchemyapi.com/api/sentiment-analysis/
  *	
  *	INPUT:
  *	flavor -> which version of the call, i.e. text, url or html.
  *	data -> the data to analyze, either the text, the url or html code.
  *	target -> the word or phrase to run sentiment analysis on.
  *	options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  *	
  *	Available Options:
  *	showSourceText	-> 0: disabled, 1: enabled
  *
  *	OUTPUT:
  *	The response, already converted from JSON to a Python object. 
*/
exports.sentiment_targeted = function(flavor, data, target, options, callback) {
	options = options || {}
	
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

		for (var key in options) {
			url += '&' + key + '=' + options[key].toString();
		}

		analyze(url, callback);
	}
};


/**
  *	Extracts the entities for text, a URL or HTML.
  *	For an overview, please refer to: http://www.alchemyapi.com/products/features/entity-extraction/ 
  *	For the docs, please refer to: http://www.alchemyapi.com/api/entity-extraction/
  *	
  *	INPUT:
  *	flavor -> which version of the call, i.e. text, url or html.
  *	data -> the data to analyze, either the text, the url or html code.
  *	options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  *	
  *	Available Options:
  *	disambiguate -> disambiguate entities (i.e. Apple the company vs. apple the fruit). 0: disabled, 1: enabled (default)
  *	linkedData -> include linked data on disambiguated entities. 0: disabled, 1: enabled (default) 
  *	coreference -> resolve coreferences (i.e. the pronouns that correspond to named entities). 0: disabled, 1: enabled (default)
  *	quotations -> extract quotations by entities. 0: disabled (default), 1: enabled.
  *	sentiment -> analyze sentiment for each entity. 0: disabled (default), 1: enabled. Requires 1 additional API transction if enabled.
  *	showSourceText -> 0: disabled (default), 1: enabled 
  *	maxRetrieve -> the maximum number of entities to retrieve (default: 50)
  *
  *	OUTPUT:
  *	The response, already converted from JSON to a Python object. 
*/
exports.entities = function(flavor, data, options, callback) {
	options = options || {}

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

		for (var key in options) {
			url += '&' + key + '=' + options[key].toString();
		}

		analyze(url, callback);
	}
};


/**
  *	Extracts the keywords from text, a URL or HTML.
  *	For an overview, please refer to: http://www.alchemyapi.com/products/features/keyword-extraction/
  *	For the docs, please refer to: http://www.alchemyapi.com/api/keyword-extraction/
  *	
  *	INPUT:
  *	flavor -> which version of the call, i.e. text, url or html.
  *	data -> the data to analyze, either the text, the url or html code.
  *	options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  *			
  *	Available Options:
  *	keywordExtractMode -> normal (default), strict
  *	sentiment -> analyze sentiment for each keyword. 0: disabled (default), 1: enabled. Requires 1 additional API transaction if enabled.
  *	showSourceText -> 0: disabled (default), 1: enabled.
  *	maxRetrieve -> the max number of keywords returned (default: 50)
  *
  *	OUTPUT:
  *	The response, already converted from JSON to a Python object. 
*/
exports.keywords = function(flavor, data, options, callback) {
	options = options || {}
	
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

		for (var key in options) {
			url += '&' + key + '=' + options[key].toString();
		}

		analyze(url, callback);
	}
};


/**
  *	Tags the concepts for text, a URL or HTML.
  *	For an overview, please refer to: http://www.alchemyapi.com/products/features/concept-tagging/
  *	For the docs, please refer to: http://www.alchemyapi.com/api/concept-tagging/ 
  *	
  *	Available Options:
  *	maxRetrieve -> the maximum number of concepts to retrieve (default: 8)
  *	linkedData -> include linked data, 0: disabled, 1: enabled (default)
  *	showSourceText -> 0:disabled (default), 1: enabled
  *
  *	OUTPUT:
  *	The response, already converted from JSON to a Python object. 
*/
exports.concepts = function(flavor, data, options, callback) {
	options = options || {}
	
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

		for (var key in options) {
			url += '&' + key + '=' + options[key].toString();
		}

		analyze(url, callback);
	}
};


/**
  *	Extracts the author from a URL or HTML.
  *	For an overview, please refer to: http://www.alchemyapi.com/products/features/author-extraction/
  *	For the docs, please refer to: http://www.alchemyapi.com/api/author-extraction/
  *	
  *	INPUT:
  *	flavor -> which version of the call, i.e. text, url or html.
  *	data -> the data to analyze, either the text, the url or html code.
  *	options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  *
  *	Availble Options:
  *	none
  *
  *	OUTPUT:
  *	The response, already converted from JSON to a Python object. 
*/
exports.author = function(flavor, data, options, callback) {
	options = options || {}
	
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

		for (var key in options) {
			url += '&' + key + '=' + options[key].toString();
		}

		analyze(url, callback);
	}
};

/**
  *	Categorizes the text for text, a URL or HTML.
  *	For an overview, please refer to: http://www.alchemyapi.com/products/features/text-categorization/
  *	For the docs, please refer to: http://www.alchemyapi.com/api/text-categorization/
  *	
  *	INPUT:
  *	flavor -> which version of the call, i.e. text, url or html.
  *	data -> the data to analyze, either the text, the url or html code.
  *	options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  *	
  *	Available Options:
  *	showSourceText -> 0: disabled (default), 1: enabled
  *
  *	OUTPUT:
  *	The response, already converted from JSON to a Python object.
*/
exports.category = function(flavor, data, options, callback) {
	options = options || {}
	
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

		for (var key in options) {
			url += '&' + key + '=' + options[key].toString();
		}

		analyze(url, callback);
	}
};


/**
  *	Extracts the relations for text, a URL or HTML.
  *	For an overview, please refer to: http://www.alchemyapi.com/products/features/relation-extraction/ 
  *	For the docs, please refer to: http://www.alchemyapi.com/api/relation-extraction/
  *	
  *	INPUT:
  *	flavor -> which version of the call, i.e. text, url or html.
  *	data -> the data to analyze, either the text, the url or html code.
  *	options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  *	
  *	Available Options:
  *	sentiment -> 0: disabled (default), 1: enabled. Requires one additional API transaction if enabled.
  *	keywords -> extract keywords from the subject and object. 0: disabled (default), 1: enabled. Requires one additional API transaction if enabled.
  *	entities -> extract entities from the subject and object. 0: disabled (default), 1: enabled. Requires one additional API transaction if enabled.
  *	requireEntities -> only extract relations that have entities. 0: disabled (default), 1: enabled.
  *	sentimentExcludeEntities -> exclude full entity name in sentiment analysis. 0: disabled, 1: enabled (default)
  *	disambiguate -> disambiguate entities (i.e. Apple the company vs. apple the fruit). 0: disabled, 1: enabled (default)
  *	linkedData -> include linked data with disambiguated entities. 0: disabled, 1: enabled (default).
  *	coreference -> resolve entity coreferences. 0: disabled, 1: enabled (default)  
  *	showSourceText -> 0: disabled (default), 1: enabled.
  *	maxRetrieve -> the maximum number of relations to extract (default: 50, max: 100)
  *
  *	OUTPUT:
  *	The response, already converted from JSON to a Python object. 
*/
exports.relations = function(flavor, data, options, callback) {
	options = options || {}
	
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

		for (var key in options) {
			url += '&' + key + '=' + options[key].toString();
		}

		analyze(url, callback);
	}
};


/**
  *	Detects the language for text, a URL or HTML.
  *	For an overview, please refer to: http://www.alchemyapi.com/api/language-detection/ 
  *	For the docs, please refer to: http://www.alchemyapi.com/products/features/language-detection/
  *	
  *	INPUT:
  *	flavor -> which version of the call, i.e. text, url or html.
  *	data -> the data to analyze, either the text, the url or html code.
  *	options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  *
  *	Available Options:
  *	none
  *
  *	OUTPUT:
  *	The response, already converted from JSON to a Python object. 
*/
exports.language = function(flavor, data, options,callback) {
	options = options || {}
	
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

		for (var key in options) {
			url += '&' + key + '=' + options[key].toString();
		}

		analyze(url, callback);
	}
};


/**
  *	Extracts the cleaned text (removes ads, navigation, etc.) for text, a URL or HTML.
  *	For an overview, please refer to: http://www.alchemyapi.com/products/features/text-extraction/
  *	For the docs, please refer to: http://www.alchemyapi.com/api/text-extraction/
  *	
  *	INPUT:
  *	flavor -> which version of the call, i.e. text, url or html.
  *	data -> the data to analyze, either the text, the url or html code.
  *	options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  *	
  *	Available Options:
  *	useMetadata -> utilize meta description data, 0: disabled, 1: enabled (default)
  *	extractLinks -> include links, 0: disabled (default), 1: enabled.
  *
  *	OUTPUT:
  *	The response, already converted from JSON to a Python object. 
*/
exports.text_clean = function(flavor, data, options, callback) {
	options = options || {}
	
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

		for (var key in options) {
			url += '&' + key + '=' + options[key].toString();
		}

		analyze(url, callback);
	}
};


/**
  *	Extracts the raw text (includes ads, navigation, etc.) for a URL or HTML.
  *	For an overview, please refer to: http://www.alchemyapi.com/products/features/text-extraction/ 
  *	For the docs, please refer to: http://www.alchemyapi.com/api/text-extraction/
  *	
  *	INPUT:
  *	flavor -> which version of the call, i.e. text, url or html.
  *	data -> the data to analyze, either the text, the url or html code.
  *	options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  *	
  *	Available Options:
  *	none
  *
  *	OUTPUT:
  *	The response, already converted from JSON to a Python object. 
*/
exports.text_raw = function(flavor, data, options, callback) {
	options = options || {}
	
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

		for (var key in options) {
			url += '&' + key + '=' + options[key].toString();
		}

		analyze(url, callback);
	}
};


/**
  *	Extracts the title for a URL or HTML.
  *	For an overview, please refer to: http://www.alchemyapi.com/products/features/text-extraction/ 
  *	For the docs, please refer to: http://www.alchemyapi.com/api/text-extraction/
  *	
  *	INPUT:
  *	flavor -> which version of the call, i.e. text, url or html.
  *	data -> the data to analyze, either the text, the url or html code.
  *	options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  *	
  *	Available Options:
  *	useMetadata -> utilize title info embedded in meta data, 0: disabled, 1: enabled (default) 
  *
  *	OUTPUT:
  *	The response, already converted from JSON to a Python object. 
*/
exports.text_title = function(flavor, data, options, callback) {
	options = options || {}
	
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

		for (var key in options) {
			url += '&' + key + '=' + options[key].toString();
		}

		analyze(url, callback);
	}
};


/**
  *	Parses the microformats for a URL or HTML.
  *	For an overview, please refer to: http://www.alchemyapi.com/products/features/microformats-parsing/
  *	For the docs, please refer to: http://www.alchemyapi.com/api/microformats-parsing/
  *	
  *	INPUT:
  *	flavor -> which version of the call, i.e.  url or html.
  *	data -> the data to analyze, either the the url or html code.
  *	options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  *	
  *	Available Options:
  *	none
  *
  *	OUTPUT:
  *	The response, already converted from JSON to a Python object. 
*/
exports.microformats = function(flavor, data, options, callback) {
	options = options || {}
	
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

		for (var key in options) {
			url += '&' + key + '=' + options[key].toString();
		}

		analyze(url, callback);
	}
};


/**
  *	Detects the RSS/ATOM feeds for a URL or HTML.
  *	For an overview, please refer to: http://www.alchemyapi.com/products/features/feed-detection/ 
  *	For the docs, please refer to: http://www.alchemyapi.com/api/feed-detection/
  *	
  *	INPUT:
  *	flavor -> which version of the call, i.e.  url or html.
  *	data -> the data to analyze, either the the url or html code.
  *	options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  *
  *	Available Options:
  *	none
  *
  *	OUTPUT:
  *	The response, already converted from JSON to a Python object. 
*/
exports.feeds = function(flavor, data, options, callback) {
	options = options || {}

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

		for (var key in options) {
			url += '&' + key + '=' + options[key].toString();
		}

		analyze(url, callback);
	}
};


/**
  *	HTTP Request wrapper that is called by the endpoint functions. This function is not intended to be called through an external interface. 
  *	It makes the call, then converts the returned JSON string into a Python object. 
  *	
  *	INPUT:
  *	url -> the full URI encoded url
  *
  *	OUTPUT:
  *	The response, already converted from JSON to a Python object. 
*/
function analyze(url, callback) {
	request.post({ url:url }, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			callback(error,JSON.parse(body));
		} else {
			callback(error,{ status:'ERROR', statusInfo:'invalid server response' });
		}
	});
}




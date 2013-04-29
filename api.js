var request = require("request"),
	_ = require("underscore")._;

/*
	# Simple API Request
*/

exports["request"] = function(params, credentials, cb) {
	
	var reqString = params.url,
		first = reqString.indexOf('?') === -1 ? true : false;
	
	_.each(params, function(val, key) {
		if(key !== 'url' && key !== 'headers') {
			reqString += first ? '?' : '&';
			reqString += key + '=' + val;
			first = false;
		}
	});
	
	if (_.isObject(credentials) && _.has(credentials, 'access_token')) {
		reqString += "&access_token=" + credentials.access_token;
	}

	request({url: reqString, headers: params.headers || {}}, function (err, res, body) {
		var result, error;
		if (!err && res.statusCode == 200) {
			try {
				result = JSON.parse(body);
				result.size = body.length;
				error = null;
			} catch(e) {
				result = {size: body.length, error:true, response: body};
				error = { msg: "Unable to parse JSON", detail: e.toString() };
			} finally {
				cb(error, result );	
			}
		} else {
			try {
				result = JSON.parse(body);
				result.size = body.length;
				error = null;
			} catch(e) {
				error = e;
				result = {size: 0, errnum:1, errtxt:"Request failed"}
			} finally {
				cb(error, result );	
			}
		}
	});
	
}

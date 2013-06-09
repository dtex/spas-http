var request = require("request"),
	_ = require("underscore")._,
	oauth = require('oauth').OAuth
;

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
	
	var handleOauthResponse = function(err, body, res) {
		handleResponse(err, res, body);
	}
	
	var handleResponse = function(err, res, body) {
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
				error = err;
			} catch(e) {
				error = err || { statusCode: res.statusCode };
				error.parseError = e;
				result = {size: 0, errnum:1, errtxt:"Request failed"}
			} finally {
				cb(error, result );	
			}
		}
	}
	
	if (credentials && credentials.type === 'oauth') {
		var oaData = credentials.authConfig;
		var oa = new oauth(oaData.requestTemporaryCredentials,
              oaData.requestAccessToken,
              oaData.oauth_consumer_key,
              oaData.client_secret,
              oaData.version,
              oaData.authorize,
              oaData.encryption),
              self = this;
		oa.get(reqString, credentials.oauth_token, credentials.oauth_token_secret, handleOauthResponse);
	} else {
		request({url: reqString, headers: params.headers || {}}, handleResponse);
	}
	
}

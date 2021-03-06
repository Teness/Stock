var logger = require('LogOperations');
var tweetOperations = require('TweetOperations');
var datetimeOperations = require('DatetimeOperations');

var args = arguments[0] || {};

var options = {
	q : 'apps'
};
var loading = false;
var data = [];
var refresh_url, next_page;
var scrollController, pullController;
var tweets;

function doInit(opts) {
	_.extend(options, opts);

	// pullController = Alloy.createWidget('nl.fokkezb.pullToRefresh');
	// Ti.API.info($.tableView.constructor.name);
	// pullController.init({
	// table: $.tableView,
	// loader: doRefresh
	// });
	$.ptr.init($.tableView);
	pullController = $.ptr;

	if (options.opener !== false) {
		$.tableView.addEventListener('click', onTableViewClick);
	} else {
		$.tableView.allowsSelection = false;
	}

	tweets = Alloy.createCollection('tweet');
	tweets.fetch();

	Ti.API.info("tweets: " + tweets.length);

	tweets.map(function(tweet) {
		// The book argument is an individual model object in the collection
		data.unshift(Alloy.createWidget('nl.fokkezb.tweetsView', 'row', tweet).getView());
	});
	// TableView object in the view with id = 'table'
	$.tableView.setData(data);
}

function openWindow(win) {

	if ( typeof options.opener === 'function') {
		options.opener(win);

	} else if ( typeof options.opener == 'object' && typeof options.opener.open === 'function') {
		options.opener.open(win);

	} else {
		win.open();
	}
}

function onTweetClick(e) {
	Ti.API.info('onTweetClick');
	// var scheme, url;
	//
	// if (e.tag) {
	// // FIXME Vereist inloggen: url = 'https://mobile.twitter.com/search?q=%23' + e.tag;
	// url = 'https://twitter.com/search?q=%23' + e.tag;
	//
	// } else if (e.user) {
	// scheme = 'twitter:@' + e.user;
	// url = 'https://mobile.twitter.com/' + e.user;
	//
	// } else {
	// url = e.link;
	// }
	//
	// if (scheme && Ti.Platform.canOpenURL(scheme)) {
	// Ti.Plaform.openURL(scheme);
	//
	// } else if (url) {
	// var win = Alloy.createWidget('nl.fokkezb.browserView', null, {
	// url: url
	// }).getView();
	//
	// openWindow(win);
	// }
}

function onTableViewClick(e) {

	Ti.API.info('onTableViewClick');

	var obj = JSON.parse(e.row.data);

	Ti.API.info(obj.content);

	var win = Alloy.createWidget('nl.fokkezb.tweetsView', 'detail', obj).getView();

	Ti.API.info('create tweetsView');

	Ti.App.addEventListener('tweetsView:click', onTweetClick);

	win.addEventListener('close', function() {
		Ti.App.removeEventListener('tweetsView:click', onTweetClick);
	});

	Ti.API.info('before open window');

	openWindow(win);
}

function doManualRefresh() {

	if (loading) {
		return false;
	}

	pullController.trigger();

	return true;
}

function doRefresh(callback) {

	if (refresh_url) {
		doLoad(refresh_url, callback);

	} else {
		doLoad('?q=' + options.q, callback)
	}
}

function doNext(callback) {
	doLoad(next_page, callback);
}

function doLoad(query, callback) {

	if (loading) {

		if (callback) {
			callback(false);
		}

		return false;
	}

	loading = true;

	loading = false;

	// var url = 'http://search.twitter.com/search.json' + query;
	//
	// var json, xhr = Ti.Network.createHTTPClient({
	// onload: function () {
	// json = JSON.parse(this.responseText);
	//
	// if (json.since_id) {
	//
	// for (var i = json.results.length - 1; i >= 0; i--) {
	// data.unshift(Alloy.createWidget('nl.fokkezb.tweetsView', 'row', json.results[i]).getView());
	// }
	//
	// } else {
	//
	// for (var i = 0; i < json.results.length; i++) {
	// data.push(Alloy.createWidget('nl.fokkezb.tweetsView', 'row', json.results[i]).getView());
	// }
	// }
	//
	// $.tableView.setData(data);
	//
	// if (!json.since_id) {
	//
	// if (json.next_page) {
	// next_page = json.next_page;
	//
	// if (!scrollController) {
	// scrollController = Alloy.createWidget('nl.fokkezb.dynamicScrolling');
	// scrollController.init({
	// table: $.tableView,
	// loader: doNext
	// });
	// }
	//
	// } else {
	// next_page = null;
	//
	// if (scrollController) {
	// scrollController.remove();
	// scrollController = null;
	// }
	// }
	// }
	//
	// refresh_url = json.refresh_url;
	//
	// if (callback) {
	// callback(true);
	// }
	//
	// loading = false;
	// },
	// onerror: function (e) {
	// Ti.API.debug(e.error);
	//
	// if (callback) {
	// callback(false);
	// }
	//
	// loading = false;
	// }
	// });
	//
	// xhr.open('GET', url);
	// xhr.send();
	//
	return true;
}

if (args.q) {
	doInit(args);
}

function addLatestTweets(tweets, e){
	tweets.map(function(tweet){
		data.unshift(Alloy.createWidget('nl.fokkezb.tweetsView', 'row', tweet).getView());
	});
	
	$.tableView.setData(data);

	e.hide(); 
}

function onPullLoader(e) {
	Ti.API.info("loading");
	
	var latestUpdatedAt = "";
	
	if (data != null && data.length > 0){
		var json = JSON.parse(data[0].data);
		if (json.createdAt != null && json.createdAt != ""){
			latestUpdatedAt = datetimeOperations.toServerDatetime(json.createdAt);
		}
	}
	//TODO replace null with stock
	tweetOperations.addLatestTweetsByStock(latestUpdatedAt, null, addLatestTweets, e); 
}

/**
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addPreviousTweets(tweets, e){
	tweets.map(function(tweet){
		data.push(Alloy.createWidget('nl.fokkezb.tweetsView', 'row', tweet).getView());
	});
	
	$.tableView.setData(data);

	e.success(); 
}

function onEndLoader(e) {
	Ti.API.info("onEndLoading");
	
	var latestUpdatedAt = "";
	
	if (data != null && data.length > 0){
		var json = JSON.parse(data[data.length - 1].data);
		latestUpdatedAt = datetimeOperations.toServerDatetime(json.createdAt);
	}
	//TODO replace null with stock
	tweetOperations.addPreviousTweetsByStock(latestUpdatedAt, null, addPreviousTweets, e); 
}

exports.init = doInit;
exports.load = doManualRefresh; 
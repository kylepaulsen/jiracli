var Promise = require('promise');
var request = require('request');

var config = require('../config');
var common = require('../common');

var transition = (function() {

    var getTransitionCode = function(issue, transitionName) {
        return new Promise(function(resolve, reject) {
            var query = 'rest/api/2/issue/' + issue + '/transitions';
            transitionName = transitionName.toLowerCase();

            request({
                url: config.jiraURL + query,
                jar: config.cookieJar,
                json: true
            }, function(err, res, body) {
                common.checkError(err, res);
                if (res.statusCode === 401) {
                    reject();
                } else {
                    var allTransitions = body.transitions;
                    var x = allTransitions.length;
                    while (x-- > 0) {
                        var trans = allTransitions[x];
                        if (trans.name.toLowerCase() === transitionName) {
                            resolve(trans.id);
                            return;
                        } else if (trans.to.name.toLowerCase() === transitionName) {
                            resolve(trans.id);
                            return;
                        }
                    }
                    reject('Transition ' + transitionName + ' was not found.');
                }
            });
        });
    };

    var to = function(issue, status) {
        if (!status) {
            console.log('A status is required!');
            process.exit(1);
        }
        issue = common.checkIssue(issue || config.currentIssue);

        return new Promise(function(resolve) {
            getTransitionCode(issue, status)
            .then(function(transitionId) {
                var query = 'rest/api/2/issue/' + issue + '/transitions';
                request({
                    method: 'POST',
                    url: config.jiraURL + query,
                    jar: config.cookieJar,
                    body: {transition: {id: transitionId}},
                    json: true
                }, function(err, res, body) {
                    common.checkError(err, res);
                    if (res.statusCode === 401) {
                        resolve(false);
                    } else {
                        console.log('Issue [' + issue + '] was set to status: ' + status + '!');
                        resolve(true);
                    }
                });
            }, function(notFound) {
                if (notFound) {
                    console.log(notFound);
                } else {
                    resolve(false);
                }
            })
            .done();
        });
    };

    return {
        to: to
    };
})();

module.exports = transition;

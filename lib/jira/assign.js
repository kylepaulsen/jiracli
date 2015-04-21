var Promise = require('promise');
var request = require('request');

var config = require('../config');
var common = require('../common');

var assign = (function() {
    var to = function(issue, assignee) {
        issue = common.checkIssue(issue || config.currentIssue);
        var query = 'rest/api/2/issue/' + issue + '/assignee';
        var realAssignee = config.users[assignee] || assignee;

        return new Promise(function(resolve) {
            request({
                method: 'PUT',
                url: config.jiraURL + query,
                jar: config.cookieJar,
                body: {name: realAssignee},
                json: true
            }, function(err, res, body) {
                common.checkError(err, res);
                if (res.statusCode === 401) {
                    resolve(false);
                } else {
                    console.log('Issue [' + issue + '] assigned to ' + assignee + '.');
                    resolve(true);
                }
            });
        });
    };

    var me = function(issue) {
        return to(issue, config.user);
    };

    return {
        to: to,
        me: me
    };
})();

module.exports = assign;

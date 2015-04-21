var Promise = require('promise');
var request = require('request');

var config = require('../config');
var common = require('../common');

var comment = (function() {

    var convertUsers = function(message) {
        var atUsers = message.match(/\@[a-zA-Z0-9]+ ?/g) || [];
        atUsers.forEach(function(user) {
            var userWithoutAt = user.trim().substring(1).toLowerCase();
            var actualUser = config.users[userWithoutAt] || userWithoutAt;
            var actualSyntax = '[~' + actualUser + '] ';
            message = message.replace(user, actualSyntax);
        });

        return message;
    }

    var make = function(issue, message) {
        issue = common.checkIssue(issue || config.currentIssue);
        return new Promise(function(resolve) {
            var query = 'rest/api/latest/issue/' + issue + '/comment';

            message = convertUsers(message);

            request({
                method: 'POST',
                url: config.jiraURL + query,
                jar: config.cookieJar,
                body: {body: message},
                json: true
            }, function(err, res, body) {
                common.checkError(err, res);
                if (res.statusCode === 401) {
                    resolve(false);
                } else {
                    console.log('Comment to issue [' + issue + '] was posted!');
                    resolve(true);
                }
            });
        });
    };

    var show = function(issue) {
        issue = common.checkIssue(issue || config.currentIssue);
        return new Promise(function(resolve) {
            var query = 'rest/api/latest/issue/' + issue + '/comment';

            request({
                url: config.jiraURL + query,
                jar: config.cookieJar,
                json: true
            }, function(err, res, body) {
                common.checkError(err, res);
                if (res.statusCode === 401) {
                    resolve(false);
                } else {
                    if (body.total > 0) {
                        console.log('\nComments for ' + issue);
                        for (var i = 0; i < body.total; ++i) {
                            var updated = new Date(body.comments[i].updated);
                            updated = ' (' + updated + ')';

                            console.log('\n' + body.comments[i].author.displayName.cyan + updated.grey);
                            console.log(body.comments[i].body);
                        }
                    } else {
                        console.log('There are no comments on this issue.');
                    }
                    console.log();
                    resolve(true);
                }
            });
        });
    };

    return {
        make: make,
        show: show
    };
})();

module.exports = comment;

var url = require('url');

var Promise = require('promise');
var request = require('request');
var openurl = require('openurl');

var common = require('../common');
var config = require('../config');

var describe = (function() {

    var open = function(issue) {
        issue = common.checkIssue(issue || config.currentIssue);
        openurl.open(url.resolve(config.jiraURL, '/browse/' + issue));
    };

    var show = function(issue) {
        issue = common.checkIssue(issue || config.currentIssue);
        return new Promise(function(resolve) {
            var query = 'rest/api/latest/issue/' + issue;

            request({
                url: config.jiraURL + query,
                jar: config.cookieJar,
                json: true
            }, function(err, res, body) {
                common.checkError(err, res);
                if (res.statusCode === 401) {
                    resolve(false);
                } else {
                    var priority = body.fields.priority || {name: ''};
                    describe.description = body.fields.description || 'No description';

                    var output = '';

                    output += 'Issue'.cyan + '\n' + body.key + '\n\n';
                    output += 'Summary'.cyan + '\n' + body.fields.summary + '\n\n';
                    output += 'Type'.cyan + '\n' + body.fields.issuetype.name + '\n\n';
                    output += 'Priority'.cyan + '\n' + priority.name + '\n\n';
                    output += 'Status'.cyan + '\n' + body.fields.status.name + '\n\n';
                    output += 'Reporter'.cyan + '\n' + body.fields.reporter.displayName + ' <' + body.fields.reporter.emailAddress + '> ' + '\n\n';
                    output += 'Assignee'.cyan + '\n' + (body.fields.assignee ? body.fields.assignee.displayName : 'Not Assigned') +
                        ' <' + (body.fields.assignee ? body.fields.assignee.emailAddress : '') + '> ' + '\n\n';
                    output += 'Labels'.cyan + '\n' + body.fields.labels.join(', ') + '\n\n';
                    output += 'Subtasks'.cyan + '\n' + body.fields.subtasks.length + '\n\n';
                    output += 'Comments'.cyan + '\n' + body.fields.comment.total + '\n\n';

                    output += '\n\n' + describe.description + '\n';
                    console.log(output);

                    resolve(true);
                }
            });
        });
    };

    var info = function(issue) {
        issue = common.checkIssue(issue || config.currentIssue);
        return new Promise(function(resolve) {
            var query = 'rest/api/latest/issue/' + issue;

            request({
                url: config.jiraURL + query,
                jar: config.cookieJar,
                json: true
            }, function(err, res, body) {
                common.checkError(err, res);
                if (res.statusCode === 401) {
                    resolve(false);
                } else {
                    var priority = body.fields.priority || {name: ''};
                    var output = '';
                    output += 'Issue'.cyan + '  ' + body.key + '\n';
                    output += 'Status'.cyan + '  ' + body.fields.status.name + '\n';
                    output += 'Summary'.cyan + '  ' + body.fields.summary + '\n';
                    output += 'Priority'.cyan + '  ' + priority.name + '\n';
                    console.log(output);

                    resolve(true);
                }
            });
        });
    };

    return {
        open: open,
        show: show,
        info: info
    };
})();

module.exports = describe;

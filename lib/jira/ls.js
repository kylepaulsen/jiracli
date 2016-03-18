var Promise = require('promise');
var request = require('request');

var common = require('../common');
var config = require('../config');
require('console.table');

var ls = (function() {

    var printIssues = function(issues) {
        if (!issues) {
            issues = [];
        }
        var limit = Math.min(issues.length, config.issueListLimit);
        if (issues.length) {
            var issues = issues.slice(0, limit).map(function(issue) {
              return {
                Issue: issue.key,
                Type: issue.fields.issuetype.name,
                Status: issue.fields.status.name,
                Assegnee: issue.fields.assignee ? (issue.fields.assignee.name) : '',
                Summary: issue.fields.summary,
                Priority: issue.fields.priority ? issue.fields.priority.name : '',
              };
            })
            console.table(issues);
        } else {
            console.log('No issues were returned.');
        }
        if (issues.length >= config.issueListLimit) {
            console.warn(('Limiting returned issues to first ' + config.issueListLimit + ' results.').yellow);
        } else {
            console.log(('Listing ' + issues.length + ' results.').cyan);
        }
    };

    var makeRequest = function(query) {
        //console.log(query);
        return new Promise(function(resolve) {
            request({
                url: config.jiraURL + query,
                jar: config.cookieJar,
                json: true
            }, function(err, res, body) {
                common.checkError(err, res);
                if (res.statusCode === 401) {
                    resolve(false);
                } else {
                    printIssues(body.issues);
                    resolve(true);
                }
            });
        });
    };

    var list = function(options) {
        var all = options.all;
        if (!config.currentProject) {
            all = true;
            console.warn(('Listing all tickets assigned to you in any project. To only search a ' +
                'specific project, run (where ABC is your project abbreviation): jira project ABC').yellow);
        }

        var query = 'rest/api/2/search?jql=assignee=currentUser()';
        var ignoreArr = config.lsIgnoreStatuses || config.listIgnoreStatuses;
        if (ignoreArr.length > 0) {
            query += '+AND+status+not+in+("' + ignoreArr.join('","') + '")';
        }
        if (!all) {
            query += '+AND+project=' + config.currentProject;
        }
        query += '+order+by+priority+DESC,+key+ASC';

        return makeRequest(query);
    };

    var search = function(searchTerm, options) {
        if (!config.currentProject) {
            options.all = true;
            console.warn(('Searching all tickets assigned to you in any project. To only search a ' +
                'specific project, run (where ABC is your project abbreviation): jira project ABC').yellow);
        }

        var query = 'rest/api/2/search?jql=' +
            '(summary+~+"%5C"' + searchTerm + '%5C""' +
            '+OR+description+~+"%5C"' + searchTerm + '%5C""' +
            '+OR+comment+~+"%5C"' + searchTerm + '%5C"")';

        if (!options.all) {
            query += '+AND+project=' + config.currentProject;
        }
        query += '+order+by+priority+DESC,+key+ASC';

        return makeRequest(query);
    };

    var jql = function(jql) {
        var query = 'rest/api/2/search?jql=' + encodeURIComponent(jql);
        return makeRequest(query);
    };

    return {
        list: list,
        search: search,
        jql: jql
    };
})();

module.exports = ls;

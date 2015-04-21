var config = require('../config');
var common = require('../common');
var auth = require('../auth');

var state = (function() {
    var infer = function(shouldInfer) {
        shouldInfer = shouldInfer.toLowerCase();
        if (shouldInfer !== 'true' && shouldInfer !== 'false') {
            console.log('jira infer: Expecting true or false.');
            process.exit(1);
        }
        config.inferFromGit = shouldInfer === 'true';
        if (!config.currentProject) {
            console.log('jiracli needs a project abbreviation to be able to infer. Run (where ABC is your project abbreviation): jira project ABC');
        }
        auth.updateConfig();
    };

    var project = function(curProject) {
        config.currentProject = curProject;
        auth.updateConfig();
    };

    var issue = function(curIssue) {
        curIssue = common.checkIssue(curIssue);
        config.currentIssue = curIssue;
        if (config.inferFromGit) {
            console.log('jiracli will now ignore issues parsed from git to focus on ' + curIssue + '. To negate this, run: jira infer true');
            config.inferFromGit = false;
        }
        auth.updateConfig();
    };

    var alias = function(alias, command) {
        config.alias[alias] = command;
        auth.updateConfig();
    };

    var addUser = function(alias, jiraName) {
        config.users[alias.toLowerCase()] = jiraName;
        auth.updateConfig();
    };

    return {
        infer: infer,
        project: project,
        issue: issue,
        alias: alias,
        addUser: addUser
    };
})();

module.exports = state;

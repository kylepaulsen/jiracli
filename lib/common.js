var config = require('./config');

var common = {
    checkError: function(err, res) {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        var stringCode = res.statusCode.toString();
        if (stringCode.charAt(0) !== '2' && stringCode !== '401') {
            console.log('Error!\n');
            console.log(res.body.errorMessages.join('\n'));
            process.exit(1);
        }
    },
    checkIssue: function(issue) {
        if (!issue) {
            console.log('I don\'t know what issue you want. Either:\n' +
                '    - Supply a issue number to the command you are trying to run.\n' +
                '    - Set your current issue with: jira issue ABC-1234\n' +
                '    - Set up jiracli to infer your issue from git:\n' +
                '        * Run: jira infer true\n' +
                '        * Run (where ABC is your project abbreviation): jira project ABC\n' +
                '        * Be in or under a directory with a .git directory.');
            process.exit(1);
        }
        if (issue.match(/^[0-9]+$/)) {
            if (config.currentProject) {
                issue = config.currentProject + '-' + issue;
            } else {
                console.log('I don\'t know what issue you want because I don\'t know your current project abbreviation.\n' +
                    '    * Run (where ABC is your project abbreviation): jira project ABC\n');
                process.exit(1);
            }
        }
        return issue;
    },
    splitCommand: function(command) {
        var commandParts = command.split(' ');
        var splitCommand = [];
        var inString = false;
        var inStringPart = '';
        commandParts.forEach(function(part) {
            if (part.charAt(0) === '"') {
                inString = true;
            }
            if (inString && part.charAt(part.length - 1) === '"') {
                inString = false;
                if (inStringPart.length) {
                    part = inStringPart + part;
                }
                part = part.replace(/^"|"$/g, '');
                inStringPart = '';
            }
            if (inString) {
                inStringPart += part + ' ';
            } else {
                splitCommand.push(part);
            }
        });
        return splitCommand;
    },
    looksLikeIssueNum: function(str) {
        str = str || '';
        return (/^[a-zA-Z]+-[0-9]+$/).test(str.trim());
    }
};

module.exports = common;

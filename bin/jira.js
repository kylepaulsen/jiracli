#!/usr/bin/env node
var fs = require('fs');
var path = require('path');

var prompt = require('prompt');
var program = require('commander');
var Promise = require('promise');
require('colors');

var common = require('../lib/common');
var commands = require('../lib/commands');
var config = require('../lib/config');
var auth = require('../lib/auth');

program.version('v0.0.1');
program._name = program._name || 'jira';

prompt.message = '';
prompt.delimiter = '';

program
.command('list')
.description('List issues assigned to you in the current project (by default)')
.option('-a, --all', 'List all tickets assigned to you in any project', String)
.action(function(options) {
    commands.run('ls:list', arguments);
});


program
.command('show [issue]')
.description('Show info about an issue')
.action(function(issue) {
    inferCurrentIssue();
    commands.run('describe:show', arguments);
});


program
.command('info [issue]')
.description('Show only most important info about an issue')
.action(function(issue) {
    inferCurrentIssue();
    commands.run('describe:info', arguments);
});


program
.command('status [issue] [status]')
.description('Change the status of an issue')
.action(function(issue, status) {
    inferCurrentIssue();
    if (config.currentIssue && !common.looksLikeIssueNum(issue) && issue) {
        commands.run('transition:to', [null, issue]);
    } else {
        commands.run('transition:to', arguments);
    }
});


program
.command('issue <issue>')
.description('Set current jira issue number')
.action(function(issueNum) {
    commands.run('state:issue', arguments);
});


program
.command('comment [issue] [text]')
.description('Comment an issue')
.action(function(issue, text) {
    inferCurrentIssue();
    if (text) {
        commands.run('comment:make', arguments);
    } else {
        if (config.currentIssue && !common.looksLikeIssueNum(issue) && issue) {
            commands.run('comment:make', [null, issue]);
        } else {
            commands.run('comment:show', arguments);
        }
    }
});


program
.command('assign [issue] [user]')
.description('Assign an issue to <user>. If no user is given, assign to me')
.action(function(issue, user) {
    inferCurrentIssue();
    if (user) {
        commands.run('assign:to', arguments);
    } else {
        if (config.currentIssue && !common.looksLikeIssueNum(issue) && issue) {
            commands.run('assign:to', [null, issue]);
        } else {
            commands.run('assign:me', arguments);
        }
    }
});


program
.command('open [issue]')
.description('Open up an issue in your browser')
.action(function(issue) {
    inferCurrentIssue();
    commands.run('describe:open', arguments);
});


program
.command('search <searchTerm>')
.description('Search for something in the main fields of tickets')
.option('-a, --all', 'Search all tickets assigned to you in any project', String)
.action(function(searchTerm, options) {
    commands.run('ls:search', arguments);
});


program
.command('jql <query>')
.description('Execute a jql query')
.action(function(query) {
    commands.run('ls:jql', arguments);
});


program
.command('infer <inferBool>')
.description('Should jiracli try to parse the issue number out of your current git branch?')
.action(function(inferBool) {
    commands.run('state:infer', arguments);
});


program
.command('project <projectAbbreviation>')
.description('Set current jira project. (For issue infering and filtering)')
.action(function(projectAbbreviation) {
    commands.run('state:project', arguments);
});


program
.command('alias <alias> <command>')
.description('Create an alias for a jiracli command')
.action(function(alias, command) {
    commands.run('state:alias', arguments);
});


program
.command('user <alias> <jiraName>')
.description('Create an alias for a user on jira. Works with assign and comment (@user)')
.action(function(alias, command) {
    commands.run('state:addUser', arguments);
});


program
.command('config')
.description('Change configuration')
.action(function() {
    askForJiraUrl()
    .then(auth.reAuth)
    .then(askForFirstProject)
    .then(askForGitInfer)
    .then(auth.updateConfig)
    .done();
});


program
.command('*')
.action(function(cmd) {
    var command = config.alias[cmd];
    if (command) {
        var args = process.argv;
        var aliasIndex = args.indexOf(cmd);
        var spliceArgs = ([aliasIndex, 1]).concat(common.splitCommand(command));
        args.splice.apply(args, spliceArgs);
        program.parse(args);
    } else {
        console.log('No command found: ' + cmd);
        console.log('Type jira --help for info.');
    }
});


function askForJiraUrl() {
    return new Promise(function(resolve) {
        var promptStr = 'Jira URL ( e.g. https://jira.xyz.com/ ):';
        prompt.get([promptStr], function(err, result) {
            if (err) {
                process.exit(1);
            }
            var jiraURL = result[promptStr];
            if (jiraURL[jiraURL.length - 1] !== '/') {
                jiraURL += '/';
            }
            config.jiraURL = jiraURL;
            resolve();
        });
    });
}

function askForFirstProject() {
    return new Promise(function(resolve) {
        console.log('\nEnter in your project abbreviation. This is used to narrow down searches and issue listings to just that project. ' +
            'It is also used for the git infer feature (more on that later).');
        var promptStr = 'Jira project abbreviation (The letters in: ABC-1234):';
        prompt.get([promptStr], function(err, result) {
            if (err) {
                process.exit(1);
            }
            config.currentProject = result[promptStr];
            resolve();
        });
    });
}

function askForGitInfer() {
    return new Promise(function(resolve) {
        console.log('\nIf you are using git, jiracli can infer the issue you are working on if you put the issue ' +
            'number in your branch: (e.g. ABC-1234/my-bug-fix). For this to work, your terminal also needs to be somewhere in a project ' +
            'using git and the jiracli project must be set (you should have just set it). However if you don\'t want to use this feature, type "no".');
        var promptStr = 'Infer issue number from current git branch?:';
        prompt.get([promptStr], function(err, result) {
            if (err) {
                process.exit(1);
            }
            if (result[promptStr].toLowerCase() === 'no') {
                config.inferFromGit = false;
            }
            resolve();
        });
    });
}

function inferCurrentIssue() {
    if (config.inferFromGit && config.currentProject) {
        var currentDir = process.cwd();
        var lastDir = '';
        while (lastDir !== currentDir && !fs.existsSync(path.join(currentDir, '.git', 'HEAD'))) {
            lastDir = currentDir;
            currentDir = path.join(currentDir, '..');
        }
        try {
            var currentHEAD = fs.readFileSync(path.join(currentDir, '.git', 'HEAD'), 'utf8');
            var issueRegEx = new RegExp(config.currentProject + '-[0-9]+', 'i');
            var possibleMatch = currentHEAD.match(issueRegEx);
            if (possibleMatch) {
                config.currentIssue = possibleMatch[0];
            } else {
                console.warn('Warning: Could not parse issue number from git. Is branch named correctly? Is current project correct?: '.yellow + config.currentProject);
                if (config.currentIssue) {
                    console.warn('Falling back to last issue. Run \'jira infer false\' to turn off these warnings.'.yellow);
                }
            }
        } catch(e) {
            console.warn('Warning: Could not parse issue number from git. May have failed to read .git/HEAD. Are you in your project dir?'.yellow);
            if (config.currentIssue) {
                console.warn('Falling back to last issue. Run \'jira infer false\' to turn off these warnings.'.yellow);
            }
        }
    }
}

function start() {
    if (!process.argv.slice(2).length) {
        program.outputHelp();
    }
    program.parse(process.argv);
}

if (!config.jiraURL) {
    prompt.start();
    console.log('Running first time set up:\n');
    askForJiraUrl()
    .then(auth.reAuth)
    .then(askForFirstProject)
    .then(askForGitInfer)
    .then(auth.updateConfig)
    .then(start)
    .done();
} else {
    auth.loadCookies();
    start();
}

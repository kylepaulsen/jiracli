var auth = require('../lib/auth');

var commands = {
    state: require('./jira/state'),
    ls: require('./jira/ls'),
    describe: require('./jira/describe'),
    assign: require('./jira/assign'),
    comment: require('./jira/comment'),
    transition: require('./jira/transition')
};

commands.run = function(command, args) {
    var commandParts = command.split(':');

    var commandToRun = commands[commandParts[0]][commandParts[1]];
    if (commandToRun) {
        var maybePromise = commandToRun.apply(null, args);
        if (maybePromise) {
            maybePromise.then(function(success) {
                if (!success) {
                    auth.reAuth()
                    .then(function() {
                        commandToRun.apply(null, args);
                    });
                }
            })
            .done();
        }
    } else {
        console.log('No such command: ' + commandParts[1]);
    }
};

module.exports = commands;

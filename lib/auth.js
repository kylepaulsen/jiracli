var fs = require('fs');
var path = require('path');

var prompt = require('prompt');
var Promise = require('promise');
var request = require('request');
var tough = require('tough-cookie');
var program = require('commander');

var config = require('./config');

var Auth = {
    ask: function(question, callback, password) {
        if (password) {
            var promptOpts = {
                properties: {}
            };
            promptOpts.properties[question] = {hidden: true};
            prompt.get(promptOpts, function(err, result) {
                if (err) {
                    process.exit(1);
                }
                var answer = result[question];
                if (answer.length > 0) {
                    callback(answer);
                } else {
                    Auth.ask(question, callback, true);
                }
            });
        } else {
            prompt.get([question], function(err, result) {
                if (err) {
                    process.exit(1);
                }
                var answer = result[question];
                if (answer.length > 0) {
                    callback(answer);
                } else {
                    Auth.ask(question, callback);
                }
            });
        }
    },

    reAuth: function() {
        return new Promise(function(resolve, reject) {
            Auth.ask('Username: ', function(user) {
                config.user = user;
                Auth.ask('Password: ', function(pass) {
                    var cookieJar = request.jar();
                    request({
                        url: config.jiraURL + 'rest/api/2/search?jql=assignee=currentUser()',
                        jar: cookieJar,
                        auth: {
                            user: user,
                            pass: pass
                        }
                    }, function(err, res) {
                        if (err) {
                            console.log('Could not log in to jira: ', err);
                            process.exit(1);
                        }
                        config.cookieJar = cookieJar;
                        Auth.updateConfig();
                        resolve();
                    });
                }, true);
            });
        });
    },

    extractCookies: function(cookieJar) {
        var cookies = [];
        var traverseJar = function(cur) {
            for (var key in cur) {
                if (cur.hasOwnProperty(key)) {
                    if (cur[key].key) {
                        // look for objects with a "key" property.
                        cookies.push(cur[key]);
                    } else {
                        traverseJar(cur[key]);
                    }
                }
            }
        };

        traverseJar(cookieJar);

        config.cookieJar = cookieJar;
        config.cookies = cookies;
    },

    loadCookies: function() {
        var cookieJar = request.jar();
        var cookieStore = cookieJar._jar.store;
        var noop = function() {};
        config.cookies.forEach(function(cookie) {
            cookieStore.putCookie(tough.fromJSON(JSON.stringify(cookie)), noop);
        });

        config.cookieJar = cookieJar;
    },

    clearConfig: function() {
        program.confirm('Are you sure? ', function(answer) {
            if (answer) {
                fs.unlinkSync(config.cfgFile);
                console.log('Configuration deleted successfully!');
            }
        });
    },

    updateConfig: function() {
        var cookieJar = config.cookieJar;
        Auth.extractCookies(cookieJar);

        delete config.cookieJar;
        fs.writeFileSync(config.cfgFile, JSON.stringify(config, null, 4));
        config.cookieJar = cookieJar;
    }
};

module.exports = Auth;

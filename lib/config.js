var fs = require('fs');
var path = require('path');

var config;
var configPath = path.join(process.env.HOME, '.jiracli');

var defaultConfig = {
    inferFromGit: true,
    currentIssue: null,
    currentProject: null,
    alias: {},
    users: {},
    lsIgnoreStatuses: [],
    issueListLimit: 50,
    cfgFile: configPath
};

if (!config) {
    if (!fs.existsSync(configPath)) {
        config = defaultConfig;
    } else {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
}

module.exports = config;

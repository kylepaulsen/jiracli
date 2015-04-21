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
    listIgnoreStatuses: [],
    issueListLimit: 50,
    cfgFile: configPath
};

if (!config) {
    if (!fs.existsSync(configPath)) {
        config = defaultConfig;
    } else {
        try {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch(e) {
            console.log('Could not read or parse ~/.jiracli config file! Invalid JSON?');
            process.exit(1);
        }
    }
}

module.exports = config;

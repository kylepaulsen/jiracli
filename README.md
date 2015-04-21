# jiracli

Yet another Jira command line interface forked and heavily modified from [jira-cmd](https://github.com/germanrcuriel/jira-cmd).

The core features / differences between this jira CLI and others are:
* Works with git - it can infer the ticket you are working on if you follow a naming scheme with the ticket number in the branch name.
* Works like git - like a state machine where you set (if jiracli hasn't infered) the issue you're working on thus making all future commands require one less argument.
* Alias support - so you can make custom commands that fit any jira states or filters. Or just shorten the default commands to a couple characters!
* User name aliases - Now you don't have to remember the weird jira names of people when commenting or assigning.
* Uses cookies and doesn't store your password.

## Installation

    npm install -g jiracli

## Usage

##### First use

    $ jira
    Running first time set up:

    Jira URL ( e.g. https://jira.xyz.com/ ): https://jira.atlassian.com/
    Username: xxxx
    Password: xxxx

    Enter in your project abbreviation. This is used to narrow down searches and issue listings to just that project. It is also used for the git infer feature (more on that later).
    Jira project abbreviation (The letters in: ABC-1234): WOW

    If you are using git, jiracli can infer the issue you are working on if you put the issue number in your branch: (e.g. ABC-1234/my-bug-fix). For this to work, your terminal also needs to be somewhere in a project using git and the jiracli project must be set (you should have just set it). However if you don't want to use this feature, type "no".
    Infer issue number from current git branch?: yes

Settings are saved in the file ~/.jiracli

##### Help

Usage: jira [options] [command]

  Commands:

    list [options]         List issues assigned to you in the current project (by default)
    show [issue]           Show info about an issue
    info [issue]           Show only most important info about an issue
    status [issue] [status] Change the status of an issue
    issue <issue>          Set current jira issue number
    comment [issue] [text] View or create comments for an issue
    assign [issue] [user]  Assign an issue to <user>. If no user is given, assign to me
    open [issue]           Open up an issue in your browser
    search [options] <searchTerm> Search for something in the main fields of tickets
    jql <query>            Execute a jql query
    infer <inferBool>      Should jiracli try to parse the issue number out of your current git branch?
    project <projectAbbreviation> Set current jira project. (For issue infering and filtering)
    alias <alias> <command> Create an alias for a jiracli command
    user <alias> <jiraName> Create an alias for a user on jira. Works with assign and comment (@user)
    config                 Change configuration
    help                   Print README.md with more detailed help.
    *

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

Some commands have individual usage help (using --help or -h)

##### Settings File

Your settings file should be located in your home directory: ~/.jiracli. This is just a big JSON file. Feel free to edit it. Fields that you might want to change are:

* listIgnoreStatuses - This is a list of strings of statuses that you want filtered out of the list command. ( ["Done", "QA"] )
* issueListLimit - This stops an issue listing from getting too long.
* alias - These are the aliases you have created in a dictionary. You can delete or edit them here too. The keys are the aliases and the values are the commands.
* users - These are the user aliases you have created in a dictionary. You can delete or edit them here too. The keys are the aliases and the values are the jira names.

##### Specific Help / Tips and Tricks

* When you have a project set, you can just supply a number as an issue argument and jiracli will add on the project abbreviation automatically.
* Remember that any commands that operate on an issue take an optional issue argument that will override the 'state machine'.
  - Use `jira issue` to change issues like you would use `git checkout` to change branches. Or just type `jira infer true` and let jiracli figure out the issue number.
* If an argument needs to have spaces in it, use quotes around it. (e.g. jira comment "this is a comment").
* Aliases are very powerful:
  - `jira alias start 'status "In Progress"'` - Now you can type - `jira start`
  - `jira alias i info`  - Now you can type - `jira i`
* User alias can be helpful when assigning an issue or commenting:
  - `jira user kyle kpauls`
  - `jira assign kyle`
  - `jira comment '@kyle fixed this.'`


## MIT License

Copyright (c) 2015 <kyle.a.paulsen@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


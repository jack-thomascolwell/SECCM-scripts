function App() {
    /**
     * @property version
     * @type String
     */
    this.version = __kernel__.version;
    
    /**
     * This will save given value into a file
     *
     * @method save
     * @param value {Array} array to save
     * @param path {String} absolute file path to save
     */
    this.save = function(value, path) {
        if (__kernel__.save(value, path)) {
            __kernel__.locateFile(path);
        }
    }
    
    /**
     * This will copy given value into a clipboard, use Ctrl + V to paste into other applications
     * Each elements in array will be separated by line break
     *
     * @method copy
     * @param value {Array} array to copy
     * @example
     *	var values = ["this", "is", "copy", "function"];
     *	app.copy(values);
     *	app.copy([1, 2, 3, 4]);
     */
    this.copy = function(value) { __kernel__.copy(value); }

    /**
     * This will print out given object's key and value pair,
     * @method dump
     * @param target {Object} object to inspect
     * @example
     *	var ar = ["this", "is", "copy", "function"];
     *	var o = { "first" : "1st", "second": "2nd" };
     *
     *	app.dump(ar); // dumps array
     *	app.dump(o);  // dumps object
     */
    this.dump = function(target) { __dump(target); }

    /**
     * This sets a file path for output logging
     * note that prefer to use slash('/') character rather than backslash('\') in dir separator
     *
     * @method setLogFile
     * @param path {String} absolute file path to save log
     * @example
     *	app.setLogFile("C:/log.txt");
     */
    this.setLogFile = function(path) { __kernel__.setLogFile(path); }

    /**
     * This will enable or disable file logging
     *
     * @method setLogFileEnabled
     * @param enabled {Boolean} true if enabled, false otherwise
     */
    this.setLogFileEnabled = function(enabled) { __kernel__.setLogFileEnabled(enabled); }

    /**
     * This will enable or disable ui popup feature for print() function
     *
     * @method setPrintOutputVisible
     * @param enabled {Boolean} true if enabled, false otherwise
     */
    this.setPrintOutputVisible = function(enabled) { __kernel__.setPrintOutputVisible(enabled); }

    /**
     * This will enable or disable ui popup feature when error detected
     *
     * @method setErrorStatusVisible
     * @param visible {Boolean} true if enabled, false otherwise
     */
    this.setErrorStatusVisible = function(visible) { __kernel__.setErrorStatusVisible(visible); }

    /**
     * This will enable or disable ui popup feature when error detected
     *
     * @method setJobStatusVisible
     * @param jobName {String} name of job to change
     * @param visible {Boolean} true if enabled, false otherwise
     */
    this.setJobStatusVisible = function(jobName, visible) {
        var id = __kernel__.findJobId(jobName);
        __kernel__.setJobStatusVisible(id, visible);
    }

    /**
     * This will start timer, which will periodically calls given `callback` function
     * If called while timer is already activated, the timer will be restarted
     *
     * @method setTimer
     * @param callback {Function} function to run whenever timer triggered
     * @param interval {Double} timer interval in ms
     * @example
     *	app.setTimer(function() { print("timeout"); }, 1000); // calls given function in 1 sec interval
     */
    this.setTimer = function(callback, interval) { __kernel__.setTimer(callback, interval, false); }

    /**
     * This will start timer, which triggers only once after starting
     *
     * @method setTimerSingleShot
     * @param callback {Function} function to run when timer triggered
     * @param interval {Double} time out value in ms
     */
    this.setTimerSingleShot = function(callback, interval) { __kernel__.setTimer(callback, interval, true); }

    /**
     * This will stop current active timer
     *
     * @method stopTimer
     */
    this.stopTimer = function() { __kernel__.stopTimer(); }

    /**
     * This will show message with ok button
     *
     * @method alert
     * @param msg {String} message to show, insert '\n' if need line break
     */
    this.alert = function(msg) {
        __waiter__.prepareUi();
        __kernel__.showMsg("alert", "Alert", msg);
        return __waiter__.waitUi();
    }

    /**
     * This will show message with [yes, no] buttons
     *
     * @method ask
     * @param msg {String} message to show, insert '\n' if need line break
     * @return {String} return 'yes' or 'no' according to user selection
     * @example
     *	if (spm.ask("Keep going ?") == "yes") {
     *	   .....
     *	}
     */
    this.ask = function(msg) {
        __waiter__.prepareUi();
        __kernel__.showMsg("ask", "Question", msg);
        return __waiter__.waitUi();
    }

    this.toString = function() { return "nx version " + this.version; }

    // utils

    /**
     * This will return iso formatted string of current date time
     * @property now
     * @type String
     * @readOnly
     */
    this.__defineGetter__("now", function() {
        var s = new Date().toISOString()
        var date = s.slice(0, 10);
        var time = s.slice(11, 19);
        return (date + " " + time);
    });

    /**
     * This will return current date as "YYYY-MM-DD" format
     * @property today
     * @type String
     * @readOnly
     */
    this.__defineGetter__("today", function() { return new Date().toISOString().slice(0, 10); });

    /**
     * This will return current time as "HH-MM-SS" format
     * @property timeStamp
     * @type String
     * @readOnly
     */
    this.__defineGetter__("timeStamp", function() { return new Date().toISOString().slice(11, 19); });

    // undocumented features
    this.include = function(path) { __include__(path); }

    this.ui = new Ui;
    this.msg = new Msg;
    this.auto = new AutoMode;
}
function Spect() {
    var part = __parts__.spect;

    /**
     * @method trigger
     * @param arg1 {String} mode
     * @param arg2 {String} type
     * @example
     *  spm.spect.trigger("fd", "here");
     *  spm.spect.trigger("fd");
     *  spm.spect.trigger({
     *      "mode":"fd",
     *      "type":"here"
     *  });
     */
    this.trigger = function(arg1, arg2) {
        var mode = "fd"; //fd, iv, it
        var type = "given"; // here, given
        switch (typeof arg1) {
        case "string":
            mode = arg1;
            switch (typeof arg2) {
            case "string": type = arg2; break;
            case "undefined": break;
            default: throw "Invalid value is specified with params";
            }

            break;

        case "object":
            mode = arg1.mode;
            type = arg1.type;
            break;

        default:
            throw "Invalid value is specified with params";
        }

        return part.start(__kernel__.findSpectModeId(mode), __kernel__.findSpectTypeId(type));
    }

    /**
     * @method start
     * @param arg1 {String} mode
     * @param arg2 {String} type
     * @example
     *  spm.spect.start("fd", "here");
     *  spm.spect.start("fd");
     *  spm.spect.start({
     *      "mode":"fd",
     *      "type":"here"
     *  });
     */
    this.start = function(arg1, arg2) {
        if (part.isRunning()) {
            throw "Already running";
        }

        this.trigger(arg1, arg2);
        __createJobWaiter('spect')();
    }

    /**
     * @method stop
     */
    this.stop = function() {
        if (part.isRunning())
            return __createSyncRun(part, 'stop', 'spect')();
    }

    /**
     * `points` represents ...
     *
     * @property points
     * @type Object
     * @example
     *  spm.spect.points = [[0,0], [100,0]}; //point list
     *	spm.spect.points = {
     *      "type":"list",
     *      "data":[[0,0], [100,0]]
     *  };
     *	spm.spect.points = {
     *      "type":"grid",
     *      "data":[[0,0], [100,0]]
     *  };
     */
    this.__defineGetter__("points", function() {

    });
    this.__defineSetter__("points", function(points) {
        var p = {};
        if (points instanceof Array) {
            p.type = "list";
            p.data = points;
        } else if (typeof points === "object") {

        } else {
            throw "Invalid value is specified with params";
        }

        var positions = items[i].pos;
        var methodName = items[i].method;
        var method = __methods[methodName];

        if (!positions instanceof Array || typeof methodName == "undefined" || typeof method == "undefined")
            continue;

        if (typeof params !== "object")
            throw "Invalid value is specified with fd params";

        var prev = __parts__.spect.ivParam();
        var merged = __merged(prev, params);
        __parts__.spect.setIVParam(merged);
    });


    /**
     * `fd` represents Force/Distance spectroscopy parameters
     *
     * @property fd
     * @type Object
     * @example
     *	var params = {
     *		"highestPos": 2.0,
     *		"lowestPos": -3.0,
     *		"offset": 0.0,
     *		"upSpeed": 0.3
     *      "downSpeed", 1.0;
     *      "upSpeed", 1.0;
     *      "forceLimit", forceLimit);
     *      "holdTime", holdTime);
     *      "useAutoOffset", useAutoOffset);
     *      "useForceLimit", useForceLimit);
     *      "useForceCorr", useForceCorr);
     *      "useSpeedSplit", useSpeedSplit);
     *      "pixelsPerDir", pixelsPerDir);
     *      "channels", channels.toVariant());
     *	};
     *
     *	spm.spect.fd = params;
     *	spm.spect.start("fd");
     */   
    this.__defineGetter__("fd", function() { return __parts__.spect.fdParam(); });
    this.__defineSetter__("fd", function(params) {
        if (typeof params !== "object")
            throw "Invalid value is specified with fd params";

        var prev = __parts__.spect.fdParam();
        var merged = __merged(prev, params);
        __parts__.spect.setFdParam(merged);
    });

    /**
     * `iv` represents Current/Voltage spectroscopy parameters
     *
     * @property iv
     * @type Object
     * @example
     *	var params = {
     *      "startBias", 0.0,
     *      "highestPos", 1.0,
     *      "lowestPos", -1.0,
     *      "endBias", 0.0,
     *      "currentLimit", currentLimit);
     *      "useZServo", useZServo);
     *      "useStartEndSplit", useStartEndSplit);
     *      "useCurrentLimit", useCurrentLimit);
     *      "isReversed", isReversed);
     *      "isLaserOff", isLaserOff);
     *      "pixels", numOfPixels);
     *      "channels", channels.toVariant());
     *	};
     *
     *	spm.spect.iv = params;
     *	spm.spect.start("iv");
     */
    this.__defineGetter__("iv", function() { return __parts__.spect.ivParam(); });
    this.__defineSetter__("iv", function(params) {
        if (typeof params !== "object")
            throw "Invalid value is specified with fd params";

        var prev = __parts__.spect.ivParam();
        var merged = __merged(prev, params);
        __parts__.spect.setIVParam(merged);
    });

    /**
     * `it` represents Current/Time spectroscopy parameters
     *
     * @property it
     * @type Object
     * @example
     *	var params = {
     *      "startBias", 0.0,
     *      "highestPos", 1.0,
     *      "lowestPos", -1.0,
     *      "endBias", 0.0,
     *      "currentLimit", currentLimit);
     *      "useZServo", useZServo);
     *      "useStartEndSplit", useStartEndSplit);
     *      "useCurrentLimit", useCurrentLimit);
     *      "isReversed", isReversed);
     *      "isLaserOff", isLaserOff);
     *      "pixels", numOfPixels);
     *      "channels", channels.toVariant());
     *	};
     *
     *	spm.spect.it = params;
     *	spm.spect.start("it");
     */
    this.__defineGetter__("it", function() { return __parts__.spect.itParam(); });
    this.__defineSetter__("it", function(params) {
        if (typeof params !== "object")
            throw "Invalid value is specified with fd params";

        var prev = __parts__.spect.itParam();
        var merged = __merged(prev, params);
        __parts__.spect.setITParam(merged);
    });


//    /**
//     *
//     * Set AD Spectroscopy parameters
//     *
//     * @method setAdParams
//     * @param adParams {Object} This is an aggregation of AD spectroscopy parameters.
//     * @example
//     *	var adParams = {
//     *      "highestPos": 0.008, // in micrometer unit
//     *      "lowestPos": 0.002, // in micrometer unit
//     *      "offset": 0.0, // in micrometer unit
//     *      "downSpeed": 0.1, // micrometer per sec
//     *      "upSpeed": 0.1, // micrometer per sec
//     *      "amplitudeLimit": 5, // // the lower amplitude limit in nanometer unit
//     *      "useAutoZOffset": true,
//     *      "useAmplitudeLimit": false
//     *	};
//     *
//     *	spm.ad.setAdParams(adParams)
//     */
//    this.setAdParams = function(adParams) {
//        this.part.setParams(adParams);
//    }
    
//    /**
//     *
//     * returns AD Spectroscopy parameters
//     *
//     * @method params
//     * @return {Object} returns an aggregation of AD spectroscopy parameters
//     * @example
//     *	var params = spm.ad.params();
//     *	params.highestPos;
//     *	params.lowestPos;
//     *	params.offset;
//     *	params.downSpeed;
//     *	params.upSpeed;
//     *	params.amplitudeLimit;
//     *	params.useAutoZOffset;
//     *	params.useAmplitudeLimit;
//     *
//     */
//    this.params = function() {
//        return this.part.params();
//    }
    
    
//    /**
//     *
//     * returns the spectroscopy data at the given index point and channel id
//     *
//     * @method  spectData
//     * @return {Array} returns the data in array
//     * @param id {String} the channel id (e.g. `"ncmamplitude"`, `"ncmphase"`, etc)
//     * @param [index] {String} the index of the point where the data you want to see was acquired <br>`If you do not give the index value, the function will return the data of the first acqusition point.`
//     * @example
//     *	spm.ad.spectData("ncmamplitude"); // returns the ncm amplitude (nm) data of the first AD spectroscopy point
//     *	spm.ad.spectData("ncmamplitude", 0); // equivalent to the first one
//     *	spm.ad.spectData("ncmphase", 2); // retunrs the ncm phase (degree) data of the third AD spectroscopy point
//     *	spm.fd.spectData("force", 1); // returns the force (nN) data of the second FD spectroscopy point.
//     */
//    this.spectData = function(id, index) {
//        return __data__.spectData(__kernel__.findChannelId(id), index);
//    }
}
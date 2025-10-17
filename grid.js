const gridOpt = {
    liftHeight: 1, // lift height between points in microns
    liftSpeed: 0.5,// lift speed um/s
    pixels: { x: 5, y: 5 },
    size: { x: 5, y: 5 }, //um
    offset: { x: 3.5, y: 5 }, //um
    settlingTime: 1000, //ms
    holdTimeAfterLift: 100, //ms,
    formCell: {
    threshold: 3.00, // threshold current (pA)
        speed: 0.25, // target approach speed (um/s)
        formCellBias: -1.5, // sample bias during cell formation (V)
        endBias: 0, // sample bias after cell formation (V)
        resetZScanner: false, // fully retract z piezo at start if true
        constantCurrentTime: 100, // time to wait after forming a cell (ms)
        minimumZStep: 0.01, // minimum z piezo step size (um)
    },
    debug: true // send debug messages if true
}

const cvOpt = {
    "bias": {
        "end": 0,
        "start": 0,
        "highest": 0,
        "lowest": -0.6,
        "isReversed": false,
    },
    "cycle": {
        "count": 1,
        "use": false
    },
    "limit": {
        "current": 10,
        "enabled": false
    },
    "pixels": 2048,
    "speed": 0.2,
};

/*
* Performs SECCM measurements at a grid of points
* @param points array of [x,y] points
* @param formCellOptions options object for the formCell function
* @param measurement function (tabs) -> void for measurement to be performed a each point
*/
function grid(gridOptions, measurement, tabs) {
    const formCellOptions = gridOptions.formCell;
    
    if (gridOptions.liftHeight === undefined) gridOptions.threshold = 1.5;
    if (gridOptions.liftSpeed === undefined) gridOptions.speed = 0.5;
    if (gridOptions.pixels === undefined) throw("Options error: grid pixels")
    if (gridOptions.size === undefined) throw("Options error: grid size")
    if (gridOptions.offset === undefined) throw("Options error: grid offset")
    if (gridOptions.settlingTime === undefined) gridOptions.settlingTime = 1000;
    if (gridOptions.holdTimeAfterLift === undefined) gridOptions.holdTimeAfterLift = 100;
    if (gridOptions.formCell === undefined) throw("Options error: form cell options")
    if (gridOptions.formCell.debug === undefined) gridOptions.formCell.debug = gridOptions.debug;
        
    if (tabs === undefined) {
        if (gridOptions.debug === undefined || !gridOptions.debug) tabs = -Infininity;
        else tabs = 0;
    }

    const points = [];
    for (var y=0; y<gridOptions.pixels.y; y++) {
        for (var x=0; x<gridOptions.pixels.x; x++) {
            points.push({
                x: (gridOptions.offset.x + (2*(y%2) - 1) * gridOptions.size.x * (0.5 - (1+2*x)/(2*gridOptions.pixels.x))),
                y: (gridOptions.offset.y - gridOptions.size.y * (0.5 - (1+2*y)/(2*gridOptions.pixels.y)))
            });
        }
    }
    log(tabs, 'Beginning grid');
    for (var i=0; i < points.length; i++) {
        const x = points[i].x;
        const y = points[i].y;

        log(tabs+1, 'Point: i='+i+' ('+x.toFixed(3)+'um, '+y.toFixed(3)+'um)');

        log(tabs+2, 'Retracting ' + gridOptions.liftHeight.toFixed(2) + 'um');
        const zRange = spm.zscanner.fullyRetractedPos - spm.zscanner.pos;
        if (gridOptions.liftHeight > zRange) {
            spm.zscanner.moveTo(spm.zscanner.fullyRetractedPos, gridOptions.liftSpeed);
            spm.sleep(100);
            spm.zstage.move(gridOptions.liftHeight - zRange, gridOptions.liftSpeed);
            spm.sleep(100);
        } else {
            spm.zscanner.moveTo(spm.zscanner.pos + gridOptions.liftHeight, gridOptions.liftSpeed);
            spm.sleep(100);
        }
        spm.sleep(gridOptions.holdTimeAfterLift);

        log(tabs+2, 'Moving to ('+x.toFixed(3)+'um, '+y.toFixed(3)+'um)');
        spm.xyscanner.moveTo(x,y);
        spm.sleep(100);

        formCell(formCellOptions, tabs+2);
        log(tabs+2, 'Settling for ' + gridOptions.holdTimeAfterLift.toFixed(0) + 'ms');
        spm.sleep(gridOptions.holdTimeAfterLift);

        log(tabs+2, 'Measuring')
        const loc = spm.dataLocation;
        const newLoc = {
            "baseDir": loc.baseDir + loc.subDir,
            "cameraSave":false,
            "direction":"auto",
            "envLogDir":loc.envLogDir,
            "fieldWidth": loc.fieldWidth,
            "fileName":i,
            "fileSuffix":"",
            "imageQualitySave": false,
            "jpegSave": false,
            "precision": 1,
            "subDir": loc.fileName
        };
        spm.dataLocation = newLoc;
        measurement();
        spm.dataLocation = loc;
        spm.sleep(100);
    }
}

/*
* Performs CV measurement
* @param options CV options object
* @param tabs number of tabs to log
*/
function cv(cvOptions, tabs) {
    cvOptions.usePeriod = false;
    if (cvOptions.bias === undefined) throw("Options error: CV bias");
    if (cvOptions.bias.start === undefined) throw("Options error: CV bias start");
    if (cvOptions.bias.end === undefined) throw("Options error: CV bias end");
    if (cvOptions.bias.highest === undefined) throw("Options error: CV bias highest");
    if (cvOptions.bias.lowest === undefined) throw("Options error: CV bias lowest");
    if (cvOptions.bias.isReversed === undefined) throw("Options error: CV bias isReversed");
    cvOptions.bias.useStartEndSplit = true;
    if (cvOptions.limit === undefined) cvOptions.limit = { "current": 10, "enabled": false };
    if (cvOptions.limit.current === undefined) cvOptions.limit = { "current": 10, "enabled": false };
    if (cvOptions.limit.enabled === undefined) cvOptions.limit = { "current": 10, "enabled": false };
    cvOptions.isLaserOff = false;
    if (cvOptions.cycle === undefined) cvOptions.cycle = { "count": 1, "use": false };
    if (cvOptions.cycle.count === undefined) cvOptions.cycle = { "count": 1, "use": false };
    if (cvOptions.cycle.use === undefined) cvOptions.cycle = { "count": 1, "use": false };
    cvOptions.biasChannel = 11;
    cvOptions.channels = [{
        "dspFilter": 0,
        "lineFit": -1,
        "name": "ChannelSampleBias",
        "planeFit": false,
        "savingRaw": false,
        "unit": "volt"
    }, {
        "dspFilter": 0,
        "lineFit": -1,
        "name": "ChannelCurrent",
        "planeFit": false,
        "savingRaw": false,
        "unit": "nanoampere"
    }, {
        "dspFilter": 0,
        "lineFit": -1,
        "name": "ChannelTimeStamp",
        "planeFit": false, "savingRaw": false,
        "unit": "microsecond"
    }],
    cvOptions.usePeriod = false;
    if (cvOptions.speed === undefined) throw("Options error: CV speed");
    cvOptions.period = cvOptions.speed;
    if (cvOptions.pixels === undefined) cvOptions.pixels = 2048;
    if (tabs === undefined) tabs = -Infinity;

    log(tabs, "Running CV");
    spm.spect.iv = cvOptions;
    const dt = (2 * (cvOptions.cycle.use * (cvOptions.cycle.count - 1) + 1) * (cvOptions.bias.highest - cvOptions.bias.lowest) + (cvOptions.bias.isReversed * 2 - 1) * (cvOptions.bias.end - cvOptions.bias.start)) / cvOptions.speed
    spm.spect.start('iv', 'here');
    log(tabs+1, "Waiting " + dt.toFixed(0) + "ms");
    spm.sleep(dt + 100);
    log(tabs+1, "Done");
}

/*
* Logs a message with a given number of tabs
* @param tabs number of tabs, a negative value prints nothing
* @param string the string to print
*/
function log(tabs, string) {
    if (tabs < 0) return;
    for(var j=0; j<tabs; j++) string = "  " + string;
    print(string);
}

/*
** Forms a cell at the current xy position
** @param options form cell parameters
** @param tabs current tab level
*/
function formCell(options, tabs) {
    /*
    ** Gets the current in pA
    ** @return current (pA)
    */
    function getCurrent() { // gets current in pA
        const current = spm.readChannel('current');
        const i = current.value * { 'nA': 1000, 'pA': 1, 'fA': 0.001 }[current.unit];
        if (isNaN(i)) throw new Error('Error reading current: invalid units');
        return i;
    }

    if (options.threshold === undefined) options.threshold = 3.00;
    if (options.speed === undefined) options.speed = 0.5;
    if (options.formCellBias === undefined) options.formCellBias = -1.5;
    if (options.endBias === undefined) options.endBias = 0;
    if (options.resetZScanner === undefined) options.resetZScanner = true;
    if (options.constantCurrentTime === undefined) options.constantCurrentTime = 30;
    if (options.minimumZStep === undefined) options.minimumZStep = 0.01;

    if (tabs === undefined) {
        if (options.debug === undefined || !options.debug) tabs = -Infininity;
        else tabs = 0;
    }

    const zScanner0 = spm.zscanner.pos;
    const zStage0 = spm.zstage.pos;
    const t0 = Date.now();

    var formedCell = false;

    log(tabs, 'Forming cell');
    log(tabs+1, "Setting sample bias to " + options.formCellBias.toFixed(2) + "V");
    spm.addChannel('current');
    spm.bias.sample = options.formCellBias;
    spm.bias.tip = 0;

    if (options.resetZScanner) {
        log(tabs+1, "Resetting z scanner");
        spm.zscanner.moveTo(spm.zscanner.fullyRetractedPos);
    }

    for (var nLoops = 0; !formedCell; nLoops++) {
        var i = getCurrent();
        log(tabs+1, "Loop " + nLoops + ": i=" + i.toFixed(4) + "pA");

        var zScanner = spm.zscanner.pos;
        var zScannerStep = options.minimumZStep;
        var t1 = Date.now();
        log(tabs+2,"Stepping z scanner");
        while ((zScanner - zScannerStep >= spm.zscanner.fullyExtendedPos) && (Math.abs(i) < options.threshold)) {
            spm.zscanner.moveTo(zScanner - zScannerStep);

            zScanner = spm.zscanner.pos;
            i = getCurrent();

            const t2 = Date.now();
            const dt = t2 - t1;
            t1 = t2;
            const dz = options.speed * dt / 1000.0; // target z step based on time passed (um)
            zScannerStep = Math.max(options.minimumZStep, dz); // don't step smaller than the minimum z step
            if (dz < options.minimumZStep) {
                spm.sleep(options.minimumZStep / options.speed * 1000.0); // slow down if moving faster than speed
            }
        }

        if(Math.abs(i) >= options.threshold) {
            log(tabs+2,"Formed cell, holding for " + options.constantCurrentTime.toFixed(0) + "ms");
            formedCell = true;
            spm.sleep(options.constantCurrentTime);
            const i2 = getCurrent();
            const iavg = (i2 + i) / 2;
            if (Math.abs(iavg) >= options.threshold) {
                log(tabs+2,"Formed cell with i=" + iavg.toFixed(4) + "pA and deltaZ =" + (spm.zscanner.pos + spm.zstage.pos - zScanner0 - zStage0).toFixed(2) + 'um');
                break;
            } else {
                log(tabs+2,"False positive with i=" + iavg.toFixed(4) + "pA");
            }
        }
        log(tabs+2, "Retracting z scanner");
        spm.zscanner.moveTo(spm.zscanner.fullyRetractedPos);
        spm.sleep(100);

        log(tabs+2, "Stepping z stage");
        const zCoarse = spm.zstage.pos;
        const zCoarseStep = (spm.zscanner.fullyRetractedPos - spm.zscanner.fullyExtendedPos) * 0.85;
        spm.zstage.moveTo(zCoarse - zCoarseStep);
        spm.sleep(100);
    }

    log(tabs+1, "Resetting sample bias to " + options.endBias.toFixed(2) + "V");
    spm.bias.sample = options.endBias;
}

grid(gridOpt, function(tabs) {cv(cvOpt, tabs)});
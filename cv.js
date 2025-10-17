const cvOptions = {
    "bias": {
        "end": 0,
        "start": 0,
        "highest": 0,
        "lowest": -0.6,
        "isReversed": false,
        "useStartEndSplit": false
    },
    "biasChannel": 11,
    "channels": [{
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
    "cycle": {
        "count": 1,
        "use": false
    },
    "isLaserOff": false,
    "lift": {
        "enabled": false,
        "height": 50
    },
    "limit": {
        "current": 10,
        "enabled": false
    },
    "period": 0.2,
    "pixels": 2048,
    "speed": 0.2,
    "usePeriod": false
};

function cv(options, filepath) {
    const loc = spm.dataLocation;
    const newLoc = {
        "baseDir": loc.baseDir,
        "cameraSave":false,
        "direction":"auto",
        "envLogDir":loc.envLogDir,
        "fieldWidth": loc.fieldWidth,
        "fileName":loc.fileName,
        "fileSuffix":"",
        "imageQualitySave": false,
        "jpegSave": false,
        "precision": 1,
        "subDir": loc.subDir + '/' + filepath
    };
    spm.dataLocation = newLoc;

    spm.spect.iv = options;
    const dt = (2 * (options.cycle.use * (options.cycle.count - 1) + 1) * (options.bias.highest - options.bias.lowest) + (options.bias.isReversed * 2 - 1) * (options.bias.end - options.bias.start)) / options.speed
    spm.spect.start('iv', 'here');
    spm.sleep(dt * 1000 + 100);
    spm.dataLocation = loc;
}

cv(cvOptions, 'testCV')
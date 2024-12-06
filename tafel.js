function getCurrent() { // gets current in pA
    const current = spm.readChannel('current');
    const i = current.value * { 'nA': 1000, 'pA': 1, 'fA': 0.001 }[current.unit];
    if (isNaN(i)) throw new Error('Error reading current: invalid units');
    return i;
}

function constantPotential(bias, duration, delay, filePath) {
    const f = ['time (ms), current (pA)'];
    const v0 = {
        sample: spm.bias.sample,
        tip: spm.bias.tip,
    };
    spm.bias.sample = bias;
    spm.bias.tip = 0;
    const t0 = Date.now();
    for (var t1 = Date.now(); t1 - t0 <= duration; t1 = Date.now()) {
        const i = getCurrent();
        const t = t1 - t0;
        f.push(t + ', ' + i);
        spm.sleep(delay);
    }
    spm.bias.sample = v0.sample;
    spm.bias.tip = v0.tip;
    
    app.save(f, filePath); //FIXME: opens new window every time
}

function lift(distance) {
    const zFine = spm.zscanner.pos;
    const zCoarse = spm.zstage.pos;

    const zFineRange = spm.zscanner.fullyRetractedPos - zFine;

    const zFineTarget = (distance < zFineRange) ? zFine + distance : spm.zscanner.fullyRetractedPos;
    const zCoarseTarget = Math.max(distance - zFineRange, 0) + zCoarse;
    spm.zscanner.moveTo(zFineTarget);
    spm.sleep(10);
    spm.zstage.moveTo(zCoarseTarget);
    spm.sleep(10);
}

function formCell(threshold, speed, formCellBias, endBias, biasChannel) {
    const minZstep = 0.01;

    var formedCell = false;
    var t1 = Date.now();
    spm.addChannel('current');
    var t0 = Date.now();
    var zCoarse0 = spm.zstage.pos;
    var zFine0 = spm.zscanner.pos;

    print('Forming cell with threshold=' + round(threshold, 3) + 'pA at ' + round(speed, 3) + 'um/s with V' + biasChannel + '=' + round(formCellBias * 1000, 0) + 'mV');
    if (biasChannel === 'tip') {
        spm.bias.tip = formCellBias;
        spm.bias.sample = 0;
    } else {
        spm.bias.tip = 0;
        spm.bias.sample = formCellBias;
    }
    while (!formedCell) {
        var i = getCurrent();

        // step z piezo
        spm.zscanner.moveTo(spm.zscanner.fullyRetractedPos);
        spm.sleep(100);

        var zFine = spm.zscanner.pos;
        var zFineStep = minZstep;
        var t1 = Date.now();
        // print('\t' + zFine + ' - ' + zFineStep + ' = ' + (zFine - zFineStep) + ' >= ' + spm.zscanner.fullyExtendedPos + ': ' + (zFine - zFineStep >= spm.zscanner.fullyExtendedPos));
        while ((zFine - zFineStep >= spm.zscanner.fullyExtendedPos) && (Math.abs(i) < threshold)) { // step z piezo while range is available and current is within threshold
            spm.zscanner.moveTo(zFine - zFineStep);

            zFine = spm.zscanner.pos;
            // print('\t\tzFine = ' + zFine + 'um');

            i = getCurrent();
            // print('\t\ti = ' + i + 'pA');

            const t2 = Date.now();
            const dt = t2 - t1;
            t1 = t2;
            const dz = speed * dt / 1000.0; // target z step based on time passed
            zFineStep = Math.max(minZstep, dz); // don't step smaller than the minimum z step
            // print('\t\tzFineStep = ' + zFineStep + 'um');

            if (dz < minZstep) {
                // print('\t\t delaying by ' + (minZstep / speed * 1000.0) + 'us');
                spm.sleep(minZstep / speed * 1000.0); // slow down if moving faster than speed
            }
        }

        if(Math.abs(i) >= threshold) {
            formedCell = true;
            break;
        }

        spm.zscanner.moveTo(spm.zscanner.fullyRetractedPos);
        spm.sleep(100);

        const zCoarse = spm.zstage.pos;
        const zCoarseStep = (spm.zscanner.fullyRetractedPos - spm.zscanner.fullyExtendedPos) * 0.85;
        spm.zstage.moveTo(zCoarse - zCoarseStep);
        spm.sleep(100);
    }
    
    if (biasChannel === 'tip') {
        spm.bias.tip = endBias;
        spm.bias.sample = 0;
    } else {
        spm.bias.tip = 0;
        spm.bias.sample = endBias;
    }

    const deltat = Date.now() - t0;
    const deltaz = zFine0 + zCoarse0 - spm.zscanner.pos - spm.zstage.pos;

    print('Formed cell with i=' + round(i, 3) + 'pA. It took ' + round(deltat / 1000, 0) + 's to travel ' + round(deltaz, 3) + 'um');
}

const threshold = 3;
const speed = 0.5;
const duration = 90000;
const delay = 20;
const formCellBias = -0.6;
const liftHeight = 5;
const center = [-20,-20]; // center of the point grid
const size = [0.5, 0.5]; // pixel size

const pathRoot = 'C:/Users/user/Desktop/JTC/Pt/18-11-2024/tafel'

// construct list of potentials
const potentials = [];
for (var v = -0.55; v <= -0.44; v+=0.01) potentials.push(v);
for (var v = 0.55; v <= 0.71; v+= 0.01) potentials.push(v);
potentials.reverse();

// Tafel Analysis

// construct point grid
const points = [];
const pixels = [Math.floor(Math.sqrt(potentials.length)), Math.ceil(potentials.length / Math.floor(Math.sqrt(potentials.length)))];
if (pixels[0] % 2 === 0) center[0] += size[0] / 2;
if (pixels[1] % 2 === 0) center[1] += size[1] / 2;
for (var i = 0; i < potentials.length; i++) {
    const c = i % pixels[0];
    const r = Math.floor(i / pixels[0]);
    const x = center[0] + size[0] * (c - Math.floor(pixels[0] / 2));
    const y = center[1] + size[1] * (r - Math.floor(pixels[1] / 2));
    points.push({
       x: x,
       y: y,
       v: potentials[i]
    });
    if (Math.max(Math.abs(x), Math.abs(y)) > 50) throw new Error('xy outside of stage limits');
}
print('Generated point grid of ' + potentials.length + ' points');

// perform analysis
for (var i = 0; i < potentials.length; i++) {
    const p = points[i];

    print('Moving to (' + round(p.x, 3) + ', ' + round(p.y, 3) + ')');

    lift(liftHeight);
    spm.xyscanner.moveTo(p.x, p.y);

    formCell(threshold, speed, formCellBias, 0, 'sample');
    print('Measuring current at Vsample=' + round(p.v*1000, 0) + 'mV');
    constantPotential(p.v, duration, delay, pathRoot + '/' + round(p.v * 1000, 0) + 'mV.csv');
}

function round(v, d) {
    return Math.round(v * Math.pow(10,d)) / Math.pow(10,d);
}
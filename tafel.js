function getCurrent() { // gets current in pA
    const current = spm.readChannel('current');
    const i = current.value * { 'nA': 1000, 'pA': 1, 'fA': 0.001 }[current.unit];
    if (isNaN(i)) throw new Error('Error reading current: invalid units');
    return i;
}

function constantPotential(bias, duration, delay, filePath) {
    const f = ['bias (V), current (pA)'];
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
    
    app.save(f, filePath);
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
const threshold = 3;
const speed = 0.5;
const duration = 2000;
const delay = 20;
const pathRoot = 'C:/Users/user/Desktop/JTC/PtGa/tafel-12-11-2024'
// construct list of potentials
const potentials = [];
for (var v = -0.6; v <= -0.4; v+=0.1) potentials.push(v);
for (var v = 0.4; v <= 1; v+= 0.1) potentials.push(v);

// Tafel Analysis

// construct point grid
const points = [];
const center = [0,0]; // center of the point grid
const size = [0.2, 0.2]; // pixel size
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
    if (Math.max(Math.abs(x), Math.abs(y) > 50)) throw new Error('xy outside of stage limits');
    print(JSON.stringify(points[i]))
}

// perform analysis
for (var i = 0; i < potentials.length; i++) {
    const p = points[i];
    lift(liftHeight);
    spm.xyscanner.moveTo(p.x, p.y);

    formCell(threshold, speed, formCellBias, 0, 'sample');

    constantPotential(p.v, duration, delay, pathRoot + '_' + Math.round(p.v * 1000) + 'mV');
}
print(constantPotential(-0.6, 2000, 10));
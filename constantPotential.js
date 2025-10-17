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

function round(v, d) {
    return Math.round(v * Math.pow(10,d)) / Math.pow(10,d);
}

function getCurrent() { // gets current in pA
    const current = spm.readChannel('current');
    const i = current.value * { 'nA': 1000, 'pA': 1, 'fA': 0.001 }[current.unit];
    if (isNaN(i)) throw new Error('Error reading current: invalid units');
    return i;
}


const pathRoot = 'C:/Users/user/Desktop/JTC/Pt/6-12-2024/constantPotential';
const duration = 90000;
const delay = 20;

for (var v=-0.4; v<=0.6; v+=0.01) {
    print('Measuring current at Vsample=' + round(v*1000, 0) + 'mV');
    constantPotential(v, duration, delay, pathRoot + '/' + round(v * 1000, 0) + 'mV.csv');
}
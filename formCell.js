const threshold= 3.00; // pA threshold current
const speed = 1; // um/s approach speed
const formCellBias = -0.6; // V bias for cell formation
const endBias = 0; // V bias after cell formation
const biasChannel = 'sample'; // "sample" or "tip" channel for biasing
const minZstep = 0.01; // um/s minimum step size for z

function getCurrent() { // gets current in pA
    const current = spm.readChannel('current');
    const i = current.value * { 'nA': 1000, 'pA': 1, 'fA': 0.001 }[current.unit];
    if (isNaN(i)) throw new Error('Error reading current: invalid units');
    return i;
}

function formCell(threshold, speed, formCellBias, endBias, biasChannel) {
    const minZstep = 0.01;

    var formedCell = false;
    var t1 = Date.now();
    spm.addChannel('current');

    print('beginning approach');
    if (biasChannel === 'tip') {
        spm.bias.tip = formCellBias;
        spm.bias.sample = 0;
    } else {
        spm.bias.tip = 0;
        spm.bias.sample = formCellBias;
    }
    while (!formedCell) {
        print('\tchecking current');
        //check current
        var i = getCurrent();
        // print('\ti = ' + i + 'pA');

        // step z piezo
        print('\t retracting z piezo');
        spm.zscanner.moveTo(spm.zscanner.fullyRetractedPos);
        spm.sleep(100);

        print('\t stepping z piezo');
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
            print('\tformed cell');
            break;
        }

        print('\t retracting z piezo');
        spm.zscanner.moveTo(spm.zscanner.fullyRetractedPos);
        spm.sleep(100);

        print('\t stepping z motor');
        const zCoarse = spm.zstage.pos;
        const zCoarseStep = (spm.zscanner.fullyRetractedPos - spm.zscanner.fullyExtendedPos) * 0.85;
        spm.zstage.moveTo(zCoarse - zCoarseStep);
        spm.sleep(100);
    }

    print('resetting bias');
    
    if (biasChannel === 'tip') {
        spm.bias.tip = endBias;
        spm.bias.sample = 0;
    } else {
        spm.bias.tip = 0;
        spm.bias.sample = endBias;
    }

    //TODO: track time taken and distance traveled
    //TODO: better gui
}

formCell(threshold, speed, formCellBias, endBias, biasChannel);
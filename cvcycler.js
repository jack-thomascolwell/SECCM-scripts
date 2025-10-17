const cycles = 1000; 
const dt = 65000; //cycle time in ms
for (var i = 0; i<cycles; i++) {
    print('starting cycle ' + (i+1) + ' out of ' + cycles);
    spm.spect.start('iv');
    spm.delay(dt);
}
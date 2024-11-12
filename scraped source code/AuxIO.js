function AuxIO() {
    this.dac = __parts__.auxDac;

    /**
     * @property out2
     * @type Object
     * @example
     *	spm.auxio.out2 = { "mode" : "off" };
     *	spm.auxio.out2 = { "mode" : "manual", "manual" : { "output" : 1.0 } };
     *	spm.auxio.out2 = { "mode" : "channel", "channel" : { "id" : "Z Height", "scale" : 100.0 } };
     *	spm.auxio.out2 = { "mode" : "others", "others" : { "id" : "LiftModeState" } };
     *	spm.auxio.out2 = { "mode" : "others", "others" : { "id" : "TipBiasOutput" } };
     */
    this.__defineGetter__("out2", function() { return this.dac.aux2(); });
    this.__defineSetter__("out2", function(config) {
        var prev = this.dac.aux2();
        var merged = __merged(prev, config);
        this.dac.setAux2(merged);
    });
}
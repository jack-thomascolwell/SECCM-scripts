function Ui() {
    /**
     *
     * When you set the UI mode with this function, NXP will show you a proper display accordingly.
     *
     * @method setMode
     * @param mode {String} This is a UI mode name (e.g. `"scan"` and `"spect"`).
     * @example
     * 	ui.setMode("scan");
     * 	ui.setMode("spect");
     */
    this.setMode = function(mode) {
        __nxp_kernel__.setDaqMode(mode);
    }
    
    /**
     *
     * You can expand or shrink the vision window.
     *
     * @method setVisionSize
     * @param option {String} A vision size parameter
     * @example
     * 	ui.setVisionSize("expand"); // can use "+" instead of "expand"
     * 	ui.setVisionSize("shrink"); // can use "-" instead of "shrink"
     *	ui.setVisionSize("toggle"); // can use "!" instead of "toggle"
     */
    this.setVisionSize = function(option) {
        __nxp_kernel__.setVisionSize(option);
    }
    
    /**
     *
     * It returns the build ID and number of the NXP you are currently using.
     *
     * @property version
     * @type String
     * @readOnly
     */
    this.__defineGetter__("version", function() { return __nxp_kernel__.appVersion(); });
}
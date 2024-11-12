function __copyInto(dest, src) {
    for (var key in src) {
        if (src.hasOwnProperty(key))
            dest[key] = src[key];
    }
}
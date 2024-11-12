function __merged(firstObject, secondObject) {
    // this will merge two objects into newly created single one,
    // if same key exists, values from second will be used

    var merged = Object();
    __copyInto(merged, firstObject);
    __copyInto(merged, secondObject);

    return merged;
}
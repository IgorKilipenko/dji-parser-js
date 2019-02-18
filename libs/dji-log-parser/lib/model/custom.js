"use strict";

var DJIBuffer = require("../djibuffer");


function Custom(buffer, index, key) {
    DJIBuffer.call(this, buffer, index, key);
}

Custom.prototype = Object.create(DJIBuffer.prototype);

Custom.prototype.get1Byte = function(){
    return this.readByte(0);
};

Custom.prototype.get2Byte = function(){
    return this.readByte(1);
}

Custom.prototype.getDistance = function() {
    return this.readFloat(6,4);
};

Custom.prototype.getHSpeed = function() {
    return this.readFloat(2,4);
};

Custom.prototype.getDateTime = function() {
    return new Date(parseInt(this.readLong(10, 8).toString())).toISOString();
};

Custom.prototype.getAllData = function() {
    return {
        distance: this.getDistance(),
        get1Byte :this.get1Byte(),
        get2Byte: this.get2Byte()
    }
}

module.exports = Custom;
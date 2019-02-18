"use strict";

var DJIBuffer = require("../djibuffer");

/**Frame total length 20 bytes */
function Custom(buffer, index, key) {
    DJIBuffer.call(this, buffer, index, key);
}

Custom.prototype = Object.create(DJIBuffer.prototype);

Custom.prototype.getIsPhoto = function(){
    return this.readByte(0) ? "true_" + this.readByte(0): "false_" + this.readByte(0);
};

Custom.prototype.getIsVideo = function(){
    return this.readByte(1) ? "true_" + this.readByte(1): "false_" + this.readByte(1);
}

Custom.prototype.get3Byte = function(){     //?? hspeed run max || travveled 2 bytes
    return `${this.readByte(18)}  __  ${this.readByte(19)}`;   //Edit to LE
    //return (this.readByte(19) << 8) | this.readByte(18)
    
};

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
        Distance: this.getDistance(),
        IsPhoto :this.getIsPhoto(),
        IsVideo: this.getIsVideo(),
        HSpeed: this.getHSpeed(),
        DateTime: this.getDateTime(),
        get3Byte: this.get3Byte()
    }
}

module.exports = Custom;
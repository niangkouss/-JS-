/**
 * 做了原生绑定的兼容
 * @constructor
 */
function Emitter() {}

Emitter.prototype.on = function (type,fn) {
    if(!this["aEmitter"+type]){
        this["aEmitter"+type] = [];
    }
    var a = this["aEmitter"+type];
    for(var i =0;i<a.length;i++){
        if(a[i] == fn){
            return this;
        }
        a.push(fn);
        return this;
    }
}

Emitter.prototype.run = function (type,e) {
    var a = this["aEmitter"+type];
    if(a&&a.length){
        for(var i = 0;i<a.length;i++){
            if(typeof a[i] == 'function'){
                a[i].call(this,e);
            }else{
                a.splice(i,1);
                i--;
            }
        }
    }
}
Emitter.prototype.off = function (type,fn) {
    var a = this['aEmitter'+type];
    if(a && a.length){
        for(var i=0;i<a.length;i++){
            if(a[i] == fn){
                a[i] = null;
                return;
            }
        }
    }
}
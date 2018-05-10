
function Drag(ele) {
    this.x=null;
    this.y = null;
    this.mx = null;
    this.my = null;
    this.ele = ele;
    this.DOWN = processThis(this.down,this);
    this.MOVE = processThis(this.move,this);
    this.UP = processThis(this.up,this);
    on(this.ele,"mousedown",this.DOWN);
}
Drag.prototype = new Emitter;


Drag.prototype.down = function (e) {
    this.x = this.ele.offsetLeft;
    this.y = this.ele.offsetTop;
    this.mx= e.pageX;
    this.my = e.pageY;
    if(this.ele.setCapture){
        this.ele.setCapture();
        on(this.ele,"mousemove",this.MOVE);
        on(this.ele,"mouseup",this.UP)
    }else{
        on(document,"mousemove",this.MOVE);
        on(document,"mouseup",this.UP);
    }
    e.preventDefault();
    this.run("dragstart",e);

}
Drag.prototype.move = function (e) {
    this.ele.style.left = e.pageX-this.mx+this.x+"px";
    this.ele.style.top = e.pageY-this.my+this.y+"px";
    this.run("dragging",e);
    //放在其原型就是为了这里用run不用call,直接this.run
}
Drag.prototype.up = function (e) {
    if(this.ele.releaseCapture){
        this.ele.releaseCapture();
        off(this.ele,"mousemove",this.MOVE);
        off(this.ele,"mouseup",this.UP);
    }else {
        off(document,"mousemove",this.MOVE);
        off(document,"mouseup",this.UP);
    }
    this.run("dragend",e);
}

Drag.prototype.addRange = function (obj) {
    this.oRange = obj;
    this.on('dragging',this.range);
}
Drag.prototype.range = function (e) {
    var orange = this.oRange;
    var x = e.pageX - this.mx+this.x;
    var y = e.pageY-this.my+this.y;
    if(x>=orange.right){
        thie.ele.style.left = orange.right+'px';
    }else if(x<=orange.left){
        this.ele.style.left = orange.left+'px';
    }else{
        this.ele.style.left = x +'px';
    }
    if(y>=orange.bottom){
        this.ele.style.top = orange.bottom +'px';
    }else if(y<=orange.top){
        this.ele.style.top = orange.top+'px';
    }else{
        this.ele.style.top = y+'px';
    }
}
Drag.prototype.border = function () {
    this.on('dragstart',this.addBorder);
    this.on('dragend',this.removeBorder);
}
Drag.prototype.addBorder = function () {
    this.ele.style.border = '2px dashed gray';
}
Drag.prototype.removeBorder = function () {
    this.ele.style.border = '';
}
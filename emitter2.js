function Drag(ele) {
    ele.onmousedown = function (e) {
        e = e || window.event;
        this.l = e.clientX - this.offsetLeft;
        this.t = e.clientY - this.offsetTop;
        if(ele.setCapture){//如果有就是IE
            this.setCapture();
            ele.onmousemove = function (e) {
                e = e || window.event;
                var l  = e.clientX - this.l;
                var t = e.clientY - this.t;
                this.style.left = l+'px';//行内元素记得有px要带px
                this.style.top = t+'px';
                e.preventDefault?e.preventDefault():e.returnValue = false;
            }
            ele.onmouseup = function (e) {
                this.releaseCapture();
                this.onmousemove = null;
                this.onmouseout = null;
            }
        }else{
            document.onmousemove = function (e) {
                var l  = this.clientX - this.l;
                var t = this.clientY - this.t;
                ele.style.left = l+'px';
                ele.style.top = t+'px';
                e.preventDefault?e.preventDefault():e.returnValue = false;
            }
            document.onmouseup = function () {
                this.onmousemove = null;
                this.onmouseout = null;
            }
        }
    }
}



function Drag(ele,range) {
    this.ele = ele;
    this.l = null;
    this.t = null;
    /*  原型链上用到this,this需要指向我们实例,也就是这里的this,以下有三种方法,bind有兼容性,建议用第二种,第三种其实复杂化了,和第二种本质是一样的*/


    /* this.ele.onmousedown = this.down.bind(this);
      给每个实例绑定方法,方法放原型,方法用到this都要指向实例,但是用bind会有兼容性问题
      所以我们这里不用bind,为什么这个bind不能直接换成call?因为call是执行后的,放在这里给onmousedown绑定的根本不是一个函数,外面要套一个函数,就变成了第二种*/

    /* var that = this;
    this.ele.onmousedown = function () {
        that.down.call(that);
        上面这样写其实就是
        that.down();
    }
    如果用call就是这样,绑定在this.ele是因为要把原型上面的函数和原生挂钩,down在原型上是可以直接用的,但是我们要绑定这个实例onmousedown的时候执行原型上的down函数,所以要绑定在实例this的上面,才会自动去原型链上找*/
    /*
      要改变this,除了上面两种,还可以给ele的onmousedown绑定函数的时候不直接绑定在原型链的函数,而是绑定传入的ele一个变量上,这个变量去原型链上找. 因为原型链上面也用到原型链上的方法,原型链不能相互嵌套,所以才在这里用变量链接了原型链*/
    var that = this;
    this.DOWN = function (e) {
        that.down(e);
    }
    this.MOVE = function (e) {
        that.move(e);
    }
    this.UP = function (e) {
        that.up(e);
    }
    this.ele.onmousedown = this.DOWN();
}


Drag.prototype.down = function (e) {
    e = e || window.event;
    this.l = e.clientX - this.ele.offsetLeft;
    this.t = e.clientY - this.ele.offsetTop;
    if(this.ele.setCapture){
        this.ele.setCapture();
        this.ele.onmousemove = this.MOVE;
        this.ele.onmouseup = this.UP;
    }else{
        document.onmousemove = this.MOVE;
        document.onmouseup = this.UP;
    }
}
Drag.prototype.move = function (e) {
    e = e||window.event;
    var l = e.clientX - this.l;
    var t = e.clientY - this.t;
    this.ele.style.left = l +'px';
    this.ele.style.top = t +'px';
    e.preventDefault?e.preventDefault():e.returnValue = false;
    /*盒子里面放图片,图片动,盒子不动,是因为图片的默认设置导致的,所以要清除默认设置*/
}
Drag.prototype.up = function (e) {
    if(this.ele.releaseCapture){
        this.ele.releaseCapture();
        this.ele.onmousemove = null;//解除绑定就赋值null
        this.ele.onmouseup = null;
    }else{
        document.onmousemove = null;
        document.onmouseup = null;
    }
}
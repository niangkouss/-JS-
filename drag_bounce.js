
    //结合发布订阅拖拽和弹跳的一个综合demo
    /**
     *
     * @param ele
     * @param type
     * @param fn
     */
//绑定函数IE8-的attachment只能绑定一个,所以要和addEventListener做兼容,并且这两个只能绑定原生的事件,自定义事件要做订阅发布,因此要做一个函数可以绑定自定义也可以绑定原生
    function on(ele,type,fn) {
        if(/^self/.test(type)){//自定义事件绑定都要以self开头
            if(!ele['aSelf'+type]){
                ele['aSelf'+type] = [];
            }
            var a = ele['aSelf'+type];
            if(a){
                for(var i = 0;i<a.length;i++){
                    if(a[i] ==fn){
                        return;
                    }
                }
                a.push(fn);
            }
        }
        if(addEventListener){
            ele.addEventListener(type,fn);
        }else{
            if(!ele['AAA'+type]){
                ele['AAA'+type] = [];
                ele.attachEvent('on'+type,function () {
                    run.call(ele);//其入事件池,我们要指出来
                })
            }
            var a =ele['AAA'+type];
            if(a && a.length){
                for(var i = 0;i<a.length;i++){
                    if(a[i]==fn){
                        return;
                    }
                }
                a.push(fn);
            }
        }
    }
    function run(e) {//如果走这里,就是IE8-的运行事件引擎
        e.target = e.srcElement;
        e = window.event;
        e.pageX = (document.documentElement.scrollLeft||document.body.scrollLeft)+e.clientX;
        e.pageY = (document.documentElement.scrollTop||document.body.scrollTop)+e.clientY;
        e.stopPropagation = function () {
            return e.cancelBubble = true;
        }
        e.preventDefault = function () {
            return e.returnValue = false;
        }

        var a = this['AAA'+e.type];//如果不传入ele,这里就用this
        if(a && a.length){
            for(var i = 0;i<a.length;i++){
                if(typeof a[i] =='function'){
                    a[i].call(this);
                }else{
                    a.splice(i,1);
                    i--;
                }
            }
        }
    }
    function selfRun(selfType,event) {
        var a = this['aSelf'+selfType];
        if(a && a.length){
            for(var i = 0;i<a.length;i++){
                if(typeof a[i] == 'function'){
                    a[i].call(this,event);
                }else{
                    a.splice(i,1);
                    i--;
                }
            }
        }
    }
    function off(ele,type,fn) {
        if(ele.removeEventListener){
            ele.removeEventListener(type,fn);
        }else{
            var a = ele['AAA'+type];
            if(a && a.length){
                for(var i = 0;i<a.length;i++){
                    if(a[i]==fn){
                        a[i] =null;//怕塌陷,所以先赋值fn
                        return;
                    }
                }
            }
        }
    }

//上面是以发布订阅模式做的兼容实现原生和自定义事件的绑定

//拖拽
    function down(e) {
        this.x = this.offsetLeft;
        this.y = this.offsetTop;
        this.mx = e.pageX;
        this.my = e.pageY;
        //原生mousedown绑定这个,在mousedown的时候瞬间绑定mousemove,mouseup的函数
        if(this.setCapture){//为了兼容IE的,怕甩掉,加条绳子
            this.setCapture();
            on(this,'mousemove',move);
            on(this,'mouseup',up);//为什么这里是this?因为不会掉,有绳子,没有绳子的就绑定在document,那么掉了也会跟上,这里做兼容的时候处理了this,所以move不用传递this
        }else{
            this.MOVE = move.bind(this);
            this.UP = up.bind(this);
            on(document,'mousemove',this.MOVE);
            on(document,'mouseup',this.UP);
            /*    var that = this;
            on(document,'mousemove',function () {
                move.call(that);
            });
            on(document,'mouseup',function () {
                up.call(that);
            })*/
        }
        e.preventDefault();
        selfRun.call(this,'selfdragstart',e);//发布,我这个时候会执行selfdragstart
    }
    function move(e) {
        this.style.left = e.pageX + this.x - this.mx +'px';
        this.style.top = e.pageY+this.y-this.my+'px';
        selfRun.call(this,'selfdragging',e);
    }
    function up(e) {
        if(this.releaseCapture){
            this.releaseCapture();
            off(this,'mousemove',move);
            off(this,'mouseup',up);
        }else{
            off(document,'mousemove',this.MOVE);
            off(document,'mouseup',this.UP);
        }
        selfRun.call(this,'selfdragend',e);
    }
//其实就分为拖拽,mousedown的时候绑定down,在其内瞬间绑定mousemove,mouseup要做的,这个时候其实就是拖拽移动,没有弹跳,弹跳是用自定义时间,在mousemove,mouseup的时候发布要执行这两个函数,我们只需要在使用的时候订阅就可以,比如在mouseup的时候让其弹跳

    function processThis(fn,context) {
        return function () {
            fn.call(context);
        }
    }
    var zIndex = 0;
    function increaseIndex() {
        this.style.zIndex = zIndex++;
    }
    function clearEffect() {
        window.clearTimeout(this.flyTimer);
        window.clearTimeout(this.dropTimer);//如果上次的没执行完还有,就清除上次的
    }
    function drop() {
        if(this.dropSpeed){
            this.dropSpeed +=9;
        }else{
            this.dropSpeed =1;
        }
        this.dropSpeed *= 0.98;
        var current = this.dropSpeed +this.offsetTop;
        var maxHeight = (document.documentElement.clientHeight||document.body.clientHeight) - this.offsetHeight;
        if(current>=maxHeight){
            this.style.top = maxHeight+'px';
            this.dropSpeed *=-1;
            this.flag ++;
        }else{
            this.style.top = current+'px';
            this.flag = 0;
        }
        if(this.flag <=2){
            this.dropTimer = window.setTimeout(processThis(drop,this),25);
        }
    }
    function fly() {
        this.flySpeed *= 0.98;
        var current = this.flySpeed +this.offsetLeft;
        var maxWidth = (document.documentElement.clientWidth||document.body.clientWidth) - this.offsetWidth;
        if(current<=0){
            this.style.left = 0;
            this.flySpeed *= -1;
        }else if(current >= maxWidth){
            this.style.left = maxWidth+'px';
            this.flySpeed *=-1;
        }else{
            this.style.left = current +'px';
        }
        if(Math.abs(this.flySpeed)>= 0.5){
            this.flyTimer = setTimeout(processThis(fly,this),25);
        }
    }
    function getSpeed(e) {
        if(this.prePosition){//自定义属性,通过move的拉动距离决定横向初速度
            this.flySpeed = e.pageX - this.prePosition;
            this.prePosition = e.pageX;
        }else{
            this.prePosition = e.pageX;
        }
    }


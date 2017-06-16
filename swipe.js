var utils = {
    addEvent: function(el, type, fn){
        el.addEventListener(type, fn);
    },
    removeEvent: function(el, type, fn){
        el.removeEventListener(type, fn);
    },
    winW: $(window).width(),
    winH: $(window).height()
},
support = (window.Modernizr && window.Modernizr.touch === true) || (function () {
        return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
    })(),
eventName = {
    start: support ? 'touchstart' : 'mousedown',
    move: support ? 'touchmove' : 'mousemove',
    end: support ? 'touchend' : 'mouseup'
};

function Swipe(options) {
    var p = $.extend({}, Swipe.defaults, options),el = '#' + p.pages;

    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    this.slides = this.el.querySelectorAll('section');
    this.tapel = p.tap;
    this.loop = p.loop;
    this.back = p.back;
    this.key = 0;
    this.nextIndex = 0;
    this.setTimer = [];
    this.timerClip = "";

    this.init();
}

Swipe.prototype.init = function() {
    $(this.slides[0]).addClass('pt-page-current');
    var keyLen = $('.pt-page-current .key').length;

    for(var i=0 ; i<keyLen; i++) {
        this.doSetTimeout(i);
    }

    utils.addEvent(this.el, eventName.start, this);
};

Swipe.prototype.start = function(e) {

    if(e.target.className === this.tapel) {
        e.preventDefault();
        this.tapnext();
        return false;
    }

    if(this.moveing) {
        e.preventDefault();
        return false;
    }

    var touches = support ? e.touches[0] : e;

    this.data = {
        startX: touches.pageX,
        startY: touches.pageY,
        distX: 0,
        distY: 0
    };


    canvidControl.pause();
    utils.addEvent(this.el, eventName.move, this);
    utils.addEvent(this.el, eventName.end, this);
};

Swipe.prototype.move = function(e) {
    var touches = support ? e.touches[0] : e;
    data = this.data;

    data.distX = touches.pageX - data.startX;
    data.distY = touches.pageY - data.startY;

    this.translate(data.distY,utils.winH);

    e.preventDefault();
};

Swipe.prototype.end = function(e) {
    this.animate();

    utils.removeEvent(this.el, eventName.move, this);
    utils.removeEvent(this.el, eventName.end, this);
};

Swipe.prototype.animate = function() {
    var self = this,
        data = this.data,
        curObj = $(this.slides[this.key]),
        nextObj = $(this.nextSlide),
        isRevert = Math.abs(data.distY) < 30;

    nextObj.addClass('pt-page-animated');
    curObj.addClass('pt-page-animated');

    this.translate((data.distY > 0 ? 1 : -1 ) * utils.winH, utils.winH, isRevert);

    this.moveing = true;

    var keyLen = $('.pt-page-current .key').length;
    for(var j=0 ; j<keyLen; j++) {
        clearTimeout(this.setTimer[j]);
    }

    setTimeout(function(){

        if(!isRevert) self.key = self.nextIndex;
        if(!isRevert) $('.key').css('display','none');
        if(isRevert) canvidControl.resume();
        self.moveing = false;

        (isRevert ? curObj : nextObj).removeAttr('style').attr('class', 'pt-page-current').siblings().removeAttr('style').removeAttr('class');

        var keyLen = $('.pt-page-current .key').length;

        for(var i=0 ; i<keyLen; i++) {
            self.doSetTimeout(i);
        }

        if($('.pt-main section').eq(0).hasClass('pt-page-current') && !isRevert){
            self.playVideo();
        }
        if(!$('.pt-main section').eq(0).hasClass('pt-page-current') && !isRevert){
            $(".key-font-1").removeClass("key-font-cur");
        }

    }, 200);
};

Swipe.prototype.translate = function(dis, win, isRevert) {
    var slideLength = this.slides.length,
        dir = dis < 0 ? 1 : -1,
        getValue = function(n) {
            var v = n || (dir * win + (isRevert ? 0 : dis));
            return '0, '+ v +'px';
        },
        index = this.key + dir,
        scale = isRevert ? 1 : (1 - Math.abs(.2 * dis / win)).toFixed(6),
        scaleV = getValue((-dir * win * (1 - scale) / 2).toFixed(6));

    if(this.back == 0 && dir == -1) {
        index = index + 1;
        return false;
    }

    if(index < 0 && this.loop == 1) {
        index += slideLength;
    }

    if(index < 0 && this.loop == 0) {
        return false;
    }

    if(index > slideLength - 1 && this.loop == 1) {
        index = 0;
    }
    if(index > slideLength - 1 && this.loop == 0) {
        return false;
    }

    this.nextIndex = index;
    this.nextSlide = this.slides[index];

    $(this.slides[index]).addClass('pt-page-action').siblings().removeClass('pt-page-action');

    this.nextSlide.style.webkitTransform = 'translate('+ getValue() +')';
    this.slides[this.key].style.webkitTransform = 'translate('+ scaleV +') scale('+ scale +')';
    // this.nextSlide.addEventListener('webkitTransitionEnd', this.endAnima, false);

};

Swipe.prototype.tapnext = function() {
    var index = this.key + 1,self = this;

    this.nextIndex = index;
    this.nextSlide = this.slides[index];

    $(this.nextSlide).addClass('pt-page-fadeout');

    this.moveing = true;

    var keyLen = $('.pt-page-current .key').length;

    for(var j=0 ; j<keyLen; j++) {
        clearTimeout(this.setTimer[j]);
    }

    setTimeout(function(){

        self.key = self.nextIndex;
        self.moveing = false;

        $(self.nextSlide).removeAttr('style').attr('class', 'pt-page-current').siblings().removeAttr('style').removeAttr('class');

        var keyLen = $('.pt-page-current .key').length;

        for(var i=0 ; i<keyLen; i++) {
            self.doSetTimeout(i);
        }

    }, 200);

};

Swipe.prototype.doSetTimeout = function(i) {
    this.setTimer[i] = setTimeout(function(){
        $('.pt-page-current .key').eq(i).css('display','block');
    },1000*i);
};

Swipe.prototype.endAnima = function() {
    // console.log(1)

};

Swipe.prototype.playVideo = function() {
    canvidControl.play('clip');
};

Swipe.prototype.delaytap = function() {

};

Swipe.prototype.handleEvent = function(e) {
    switch(e.type) {
        case 'touchstart':
        case 'mousedown':
            this.start(e);
            break;
        case 'touchmove':
        case 'mousemove':
            this.move(e);
            break;
        case 'touchend':
        case 'mouseup':
            this.end(e);
            break;
    }
};

Swipe.defaults = {
    pages : '#pt-main',
    loop  : 0,
    back  : 0
};

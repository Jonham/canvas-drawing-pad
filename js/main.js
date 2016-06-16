// main
var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var resetCanvas = function(e) {
    // var div = canvas.parentNode;
    var b = canvas.getBoundingClientRect(canvas);
    canvas.width = b.width;
    canvas.height = b.height;
    // NS.debug('canvas: W:' + b.width + ' H:' + b.height);
    ctx.fillStyle = 'yellow';
    ctx.strokeStyle = 'yellow';
    ctx.lineCap = 'round';
};
$on(window, 'load', resetCanvas);
$on(window, 'resize', resetCanvas);

var Pen = {
    ctx: ctx,
    temp: {}, // store temp data
    width: 10,
    calWidth: function(p) {
        var s = Pen.speed(p);
        var ratio;
        if (s <= 1) {
            ratio = 1;
        } else if ( s <= 3) {
            ratio = 0.8;
        } else if ( s <= 5) {
            ratio = 0.5;
        } else {
            ratio = 0.3;
        }
        var w = Pen.width * ratio;
        Pen.ctx.lineWidth = w;
        return w;
    },
    withSpeed: true,
    speed: function(p) {
        var t = Pen.temp;
        var last = t.last;
        var now = p;

        var distance = function(last,now) {
            var pow = function(a,b) {
                return Math.pow((a - b), 2);
            };
            return Math.sqrt( pow(now.x, last.x) + pow(now.y, last.y));
        };

        if (last) {
            var d = distance(last, now);
            Pen.temp.last = now;
            return d;
        }
        else {
            Pen.temp.last = now;
            return 0;
        }
    },
    TOP : canvas.clientTop,
    LEFT: canvas.clientLeft,
    point: function( p ) {
        return {
            x: p.clientX - Pen.LEFT,
            y: p.clientY - Pen.TOP
        };
    },
    moveTo: function( e ) {
        var p = Pen.point(e);
        Pen.temp.last = undefined;

        Pen.ctx.beginPath();
        Pen.ctx.moveTo(p.x, p.y);
        return p;
    },
    lineTo: function( e ) {
        var p = Pen.point(e);

        var w = Pen.calWidth(p);
        Pen.ctx.lineTo(p.x, p.y);

        return p;
    },
    stroke: function( e ) {
        Pen.ctx.stroke();
    },
};

// event wrap up both destop and mobile
var Events = {
    begin: (function(M){
        return M? 'touchstart': 'mousedown';
    }(isMobile)),
    move: (function(M){
        return M? 'touchmove': 'mousemove';
    }(isMobile)),
    end: (function(M){
        return M? 'touchend': 'mouseup';
    }(isMobile)),
};
var Draw = {
    mousedown: function(e) {
        e.preventDefault();
        e.stopPropagation();
        $on(window, Events.move, Draw.move);
        $on(window, Events.end, Draw.end);

        if (isMobile) {
            var p = e.touches[0];
            Pen.moveTo(p);
        } else {
            Pen.moveTo(e);
        }
    },
    move: function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (isMobile) { e = e.touches[0]; }
        var p = Pen.lineTo(e);
        Pen.stroke();
    },
    end: function(e) {
        e.preventDefault();
        e.stopPropagation();
        $off(window, Events.move, Draw.move);
        $off(window, Events.end, Draw.end)
        Pen.stroke();
    }
};

$on(canvas, Events.begin, Draw.mousedown);

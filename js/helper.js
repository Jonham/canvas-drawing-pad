// helper function
var isMobile = (function() { return null === document.ontouchend; }());
var $on = function(target, event, fn) {
    return target.addEventListener(event,fn,false);
};
var $off = function(target, event, fn) {
    return target.removeEventListener(event,fn,false);
};

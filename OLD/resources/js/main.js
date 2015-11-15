function loadExperience(which) {
    var animLength = 0.5;
    TweenLite.to(document.getElementById("desktop"), animLength, {right: "100%"});
    TweenLite.to(document.getElementById("footer"), animLength, {bottom: "-40px"});
    TweenLite.to(document.getElementById("big-screen"), animLength, {left: "100%", onComplete:function(){location.href = (which == 0) ? "/desktop.html" : "/big_screen.html";}});
}
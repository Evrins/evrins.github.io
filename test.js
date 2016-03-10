function startUp() {
    console.log('start');
    var el = document.getElementById('canvas');
    el.ontouchstart = onStart;
}

function onStart(ev) {
    // ev.preventDefault();
    console.log('on start');
}
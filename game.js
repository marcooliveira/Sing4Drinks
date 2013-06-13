var osc = require('node-osc');

var launchpadder = require('launchpadder').Launchpad;
var Color = require('launchpadder').Color;
var colors = require('colors');
var mout = require('mout');

// 0,0 are the midi ports that are selected
var pad = new launchpadder(0, 0);

pad.on('press', function (button) {
    if (button.getY() === 8) {
        switch(button.getX()) {
            case 7:
                resetGame();
                break;
            case 6:
                win();
                break;
            case 5:
                lose();
                break;
            case 4:
                smile();
                break;
            case 3:
                meh();
                break;
            case 2:
                cry();
                break;
        }
    }
});

// ----------------------------- GAME LOGIC ------------------------------------

var oscServer = new osc.Server(3333, '0.0.0.0');
oscServer.on("message", function (msg, rinfo) {
    console.log('got message: ', msg);
    switch (msg[0]) {
        case '/score':
            console.log('plotting:', msg[1]);
            plotSingingEval(msg[1]);
            break;
        case '/drink':
            console.log('plotting:', msg[1]);

            if (msg[1] >= 0.5) {
                win();
            }
            else {
                lose();
            }

            plotSingingEval(msg[1]);
            break;
        case '/reset':
            resetGame();
            break;
    }
});

// ----------------------------- DRAWING ---------------------------------------

var singEvalColorMap = [Color.RED, Color.RED, Color.AMBER, Color.AMBER, Color.AMBER, Color.AMBER, Color.GREEN, Color.GREEN];
function plotSingingEval(val) {
    for (y = 0; y < 8; y++) {

        if ((y / 8) <= val) {
            for (x = 0; x < 8; x++) {
                pad.getButton(x, 7 - y).light(singEvalColorMap[y]);
            }
        } else {
            for (x = 0; x < 8; x++) {
                pad.getButton(x, 7 - y).dark();
            }
        }
    }
}

var colorMap = {
    G: Color.GREEN,
    g: Color.LOW_GREEN,
    R: Color.RED,
    r: Color.LOW_RED,
    A: Color.AMBER,
    a: Color.LOW_AMBER,
    Y: Color.YELLOW,
    ' ': Color.OFF
};


var happyFace = [
    '  GG GG  ',
    '  GG GG  ',
    '         ',
    ' R     R ',
    ' RR   RR ',
    '  RRRRR  ',
    '   RRR   ',
    '         '
];

var mehFace = [
    '  GG GG  ',
    '  GG GG  ',
    '         ',
    '         ',
    ' RRRRRRR ',
    ' RRRRRRR ',
    '         ',
    '         '
];

var sadFace = [
    '  YY YY  ',
    '  YY YY  ',
    '         ',
    '   RRR   ',
    '  RRRRR  ',
    ' RR   RR ',
    ' R     R ',
    '         '
];

function light() {
    var x,y,color;

    if (mout.lang.isArray(arguments[0])) {
        var points = arguments[0];
        color = arguments[2];

        for (var i = 0; i < points.length; i++) {
            pad.getButton(points[i][0], points[i][1]).light(color);
        }
    } else {
        x = arguments[0];
        y = arguments[1];
        color = arguments[2];
        pad.getButton(x, y).light(color);
    }
}

function dark(x, y) {
    pad.getButton(x, y).dark();
}

function draw(map) {
    var x,y;
    for (x = 0; x < 8; x++) {
        for (y = 0; y < 8; y++) {
            light(x, y, colorMap[map[y][x]]);
        }
    }
}

function smile() {
    draw(happyFace);
}

function cry() {
    draw(sadFace);
}

function meh() {
    draw(mehFace);
}

function allDark() {
    var x,y;
    for (x = 0; x <= 8; x++) {
        for (y = 0; y <= 8; y++) {
            if (x === 0 && y === 8) continue;
            pad.getButton(x,y).dark();
        }
    }
}

function resetGame() {
    swipeDown(Color.YELLOW, 30, function () {
        pad.allDark();
    });
}

// ----------------------------- ANIMATIONS ------------------------------------

function swipeDown(color, delay, cb) {
    for (var i = 0; i < 8; i++) {
        setTimeout((function (y) {
            return function () {
                for (var x = 0; x < 8; x++) light(x, y, color);
            };
        })(i), delay * i);
    }

    for (i = 0; i < 8; i++) {
        setTimeout((function (y) {
            return function () {
                for (var x = 0; x < 8; x++) dark(x, y);
            };
        })(i), 8 * delay + delay * i);
    }

    if (cb) {
        setTimeout(cb, 16 * delay);
    }
}

function win() {
    swipeDown(Color.GREEN, 30, function () {
        var timeline = ['smile', 'allDark', 'smile', 'allDark', 'smile', 'clearInterval'];

        var frame = 0;
        var processFrame = function () {
            switch (timeline[frame]) {
                case 'smile':
                    smile();
                    break;
                case 'allDark':
                    allDark();
                    break;
                case 'clearInterval':
                    clearInterval(timer);
                    break;
            }

            frame++;
        }

        var timer = setInterval(processFrame, 400);
        processFrame();
    });
}

function lose() {
    swipeDown(Color.RED, 30, function () {
        var timeline = ['cry', 'allDark', 'cry', 'allDark', 'cry', 'clearInterval'];

        var frame = 0;
        var processFrame = function () {
            switch (timeline[frame]) {
                case 'cry':
                    cry();
                    break;
                case 'allDark':
                    allDark();
                    break;
                case 'clearInterval':
                    clearInterval(timer);
                    break;
            }

            frame++;
        }

        var timer = setInterval(processFrame, 400);
        processFrame();
    });
}


// -----------------------------------------------------------------------------


resetGame();


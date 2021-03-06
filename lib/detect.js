var cv       = require('opencv');
var detector = require('./detector');

var display = new cv.NamedWindow("result");

var input;

if (process.argv.length == 3) {
  input = function (next) {
    cv.readImage(process.argv[2], next);
  };
} else {
  var camera = new cv.VideoCapture(0);

  input = function (next) {
    camera.read(function(im) {
      next(null, im);
    });
  };
}

captureImage = function (next) {
  cv.readImage('../board.png', next);
};

var keepAlive = function () {
  input( function (err, mat) {
    display.show( detector(mat) );
  });

  setTimeout(keepAlive, 10);
};

keepAlive();
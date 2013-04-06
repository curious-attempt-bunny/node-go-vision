var cv = require('opencv');
var _  = require('underscore');

var lineSlope = function (line) {
  var x = Math.abs(line[2] - line[0]);
  var y = line[3] - line[1];
  if (x == 0)
    return 100;
  else
    return (y*1.0)/x;
};

var lineDetect = function (mat) {
  var edges = mat.clone();
  edges.convertGrayscale();
  edges.canny(5, 300);

  return edges.houghLinesP();
};

// TODO improve on this:
var groupLines = function (lines) {
  return _.filter(lines, function (line) {
    return (Math.abs(lineSlope(line)) < 0.2);
  });
};

module.exports = function (mat) {
  var lines = lineDetect(mat);
  var dominateLines = groupLines(lines);

  _.each(dominateLines, function (line) {
    mat.line([line[0], line[1]], [line[2], line[3]], [0,255,0]);
  });

  return mat;
};
var cv = require('opencv');
var _  = require('underscore');

var lineDetect = function (mat) {
  var edges = mat.clone();
  edges.convertGrayscale();
  edges.canny(5, 300);

  return edges.houghLinesP();
};

module.exports = function (mat) {
  var lines = lineDetect(mat);

  _.each(lines, function (line) {
    mat.line([line[0], line[1]], [line[2], line[3]], [0,255,0]);
  });

  return mat;
};
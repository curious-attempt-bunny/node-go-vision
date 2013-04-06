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

// TODO improve on this:
var mergeLines = function (lines) {
  lines = _.sortBy(lines, function (line) {
    return line[1];
  });

  var bands = [];
  var currentBand = null;
  var margin = 5;
  _.each(lines, function (line) {
    if (!currentBand) {
      currentBand = line;
    } else if (Math.abs(currentBand[1] - line[1]) <= margin) {
      currentBand = [
        Math.min(currentBand[0], line[0]),
        (currentBand[1]+line[1])/2,
        Math.max(currentBand[2], line[2]),
        (currentBand[3]+line[3])/2
      ];
    } else {
      bands.push(currentBand);
      currentBand = line;
    }
  });
  if (currentBand) {
    bands.push(currentBand);
  }

  return bands;
};

module.exports = function (mat) {
  var lines = lineDetect(mat);
  var dominantLines = groupLines(lines);
  dominantLines = mergeLines(dominantLines);

  var output = mat; //new cv.Matrix(mat.height(), mat.width());

  _.each(dominantLines, function (line) {
    output.line([line[0], line[1]], [line[2], line[3]], [0,255,0], 1);
  });

  return output;
};
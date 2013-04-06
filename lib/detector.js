var cv = require('opencv');
var _  = require('underscore');

var lineSlope = function (line) {
  var x = Math.abs(line[2] - line[0]);
  var y = line[3] - line[1];
  if (x === 0)
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

// TODO improve on this
var medianInterval = function (lines) {
  var intervals = [];

  _.each(lines, function (line, index) {
    if (index > 0) {
      intervals.push(Math.abs(line[1]-lines[index-1][1]));
    }
  });

  intervals = _.sortBy(intervals, function (interval) { return interval; });

  return intervals[Math.floor(intervals.length/2)];
};

// TODO improve on this
var pruneLinesPortion = function (lines) {
  var interval = medianInterval(lines);
  var retained = [];
  var previous = null;

  _.each(lines, function (line) {
    if (!previous) {
      previous = line;
    } else {
      var delta = Math.abs(line[1] - previous[1]);
      if (delta > interval * 0.8 && delta < interval * 1.5) {
        retained.push(previous);
        previous = line;
        interval = delta;
      }
    }
  });
  retained.push(previous);

  return retained;
};

var pruneLines = function (lines) {
  var top = lines.slice(0, Math.floor(lines.length/2)+1); // keeping one extra
  var bottom = lines.slice(Math.floor(lines.length/2), lines.length);

  top.reverse();
  var prunedTop = pruneLinesPortion(top);
  prunedTop.reverse();
  prunedTop.pop(); // discarding the extra

  var prunedBottom = pruneLinesPortion(bottom);

  return prunedTop.concat(prunedBottom);
};

module.exports = function (mat) {
  var lines = lineDetect(mat);
  lines = groupLines(lines);
  lines = mergeLines(lines);
  lines = pruneLines(lines);
  console.dir(lines);

  var output = mat; //new cv.Matrix(mat.height(), mat.width());

  _.each(lines, function (line) {
    output.line([line[0], line[1]], [line[2], line[3]], [0,255,0], 1);
  });

  return output;
};
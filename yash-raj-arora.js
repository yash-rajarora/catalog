const fs = require("fs");

function parseValue(base, value) {
  return parseInt(value, parseInt(base));
}

function interpolate(points, x) {
  let result = 0;
  for (let i = 0; i < points.length; i++) {
    let term = points[i].y;
    for (let j = 0; j < points.length; j++) {
      if (i !== j) {
        term = (term * (x - points[j].x)) / (points[i].x - points[j].x);
      }
    }
    result += term;
  }
  return Math.round(result);
}

function getCombinations(array, k) {
  let combinations = [];
  function backtrack(start, current) {
    if (current.length === k) {
      combinations.push(current.slice());
      return;
    }
    for (let i = start; i < array.length; i++) {
      current.push(array[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }
  backtrack(0, []);
  return combinations;
}

function findMostCommon(arr) {
  let counts = {};
  let maxCount = 0;
  let maxElement = null;
  for (let i = 0; i < arr.length; i++) {
    let element = arr[i];
    counts[element] = (counts[element] || 0) + 1;
    if (counts[element] > maxCount) {
      maxCount = counts[element];
      maxElement = element;
    }
  }
  return maxElement;
}

function recoverSecret(data) {
  const keys = data["keys"];
  let points = [];
  for (let key in data) {
    if (key !== "keys") {
      let base = data[key].base;
      let value = data[key].value;
      let y = parseValue(base, value);
      points.push({ x: parseInt(key), y: y });
    }
  }
  let combinations = getCombinations(points, keys.k);
  let secrets = [];
  for (let i = 0; i < combinations.length; i++) {
    let secret = interpolate(combinations[i], 0);
    secrets.push(secret);
  }
  return findMostCommon(secrets);
}

function processTestCase(filename) {
  fs.readFile(filename, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading file ${filename}:`, err);
      return;
    }
    try {
      const testCase = JSON.parse(data);
      console.log(`Secret for ${filename}:`, recoverSecret(testCase));
    } catch (err) {
      console.error(`Error parsing JSON from ${filename}:`, err);
    }
  });
}

// Process both test cases
processTestCase("test.json");
processTestCase("testcase2.json");
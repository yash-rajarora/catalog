const fs = require("fs");

// Function to parse value based on a given base
function parseValue(base, value) {
  return parseInt(value, parseInt(base));
}

// Lagrange interpolation function
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

// Function to get all combinations of size k
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

// Function to find the incorrect roots allowing up to 3 errors
function findIncorrectRoots(points, correctSecret) {
  let incorrectRoots = [];
  
  for (let i = 0; i < points.length; i++) {
    // Use all points except the current one
    let subset = points.slice(0, i).concat(points.slice(i + 1));
    let interpolatedValue = interpolate(subset, points[i].x);
    
    // If the interpolated value doesn't match the original value, it's incorrect
    if (interpolatedValue !== points[i].y) {
      incorrectRoots.push(points[i].x);
    }
  }

  // If there are more than 3 incorrect roots, we limit the errors to 3
  if (incorrectRoots.length > 3) {
    incorrectRoots = incorrectRoots.slice(0, 3);
  }

  return incorrectRoots;
}

// Function to recover the secret and identify incorrect roots
function recoverSecret(data) {
  const keys = data["keys"];
  let points = [];
  
  // Parse the points from the input
  for (let key in data) {
    if (key !== "keys") {
      let base = data[key].base;
      let value = data[key].value;
      let y = parseValue(base, value);
      points.push({ x: parseInt(key), y: y });
    }
  }

  // Generate all combinations of size k
  let combinations = getCombinations(points, keys.k);
  let secrets = [];

  // Interpolate for each combination and store the secret
  for (let i = 0; i < combinations.length; i++) {
    let secret = interpolate(combinations[i], 0);
    secrets.push(secret);
  }

  // Get the most common secret
  let correctSecret = findMostCommon(secrets);

  // Find the incorrect roots by comparing the interpolated results
  let incorrectRoots = findIncorrectRoots(points, correctSecret);
  return { correctSecret, incorrectRoots };
}

// Utility function to find the most common element in an array
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

// Function to process a test case from file
function processTestCase(filename) {
  fs.readFile(filename, "utf8", (err, data) => {
    if (err) {
      console.error('Error reading file ${filename}:', err);
      return;
    }
    try {
      const testCase = JSON.parse(data);
      const { correctSecret, incorrectRoots } = recoverSecret(testCase);
      console.log('Secret for ${filename}: ${correctSecret}');
      console.log('Incorrect roots for ${filename}:', incorrectRoots.length > 0 ? incorrectRoots : "None");
    } catch (err) {
      console.error('Error parsing JSON from ${filename}:', err);
    }
  });
}

// Process both test cases
processTestCase("test.json");
processTestCase("testcase2.json");
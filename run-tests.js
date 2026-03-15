// Simple Test Runner for White Box Testing

// Run all test files
const testFiles = [
  './tests/login.test.js',
  './tests/activity.test.js'
];

testFiles.forEach((file) => {
  require(file);
});

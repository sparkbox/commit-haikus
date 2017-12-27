var syllable = require('syllable');

function run() {
  console.log('the bot ran');
}

function isHaiku(text) {
  const syllableCount = syllable(text);
  console.log(`Syllable count: ${syllableCount}`);
  return (syllableCount === 17);
}

module.exports = {
  run: run,
  isHaiku: isHaiku
};
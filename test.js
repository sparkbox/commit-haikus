const testBot = require('./bot.js');

function identifyCorrectHaiku() {
  const haiku1 = "Update the embed so it only includes the newest flash content";
  return testBot.isHaiku(haiku1);
}

// incorrect number of syllables (12 instead of 17)
function identifyIncorrectHaiku1() {
  const nonHaiku1 = "cleanup: Addresses missing packages and docs";
  return !testBot.isHaiku(nonHaiku1);
}

// incorrect distribution of syllables across three lines (with correct # of syllables: 17)
function identifyIncorrectHaiku2() {
  const nonHaiku2 = "docs: add code comment to document use of 'muted' in video";
  return !testBot.isHaiku(nonHaiku2);
}

const tests = [
  identifyCorrectHaiku,
  identifyIncorrectHaiku1,
  identifyIncorrectHaiku2
];

tests.forEach((test, index) => {
  if (test()) {
    console.log(`Test ${index} passed.`);
  } else {
    console.log(`Test ${index} failed.`);
  }
  console.log('');
});

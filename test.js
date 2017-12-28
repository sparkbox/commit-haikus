const utils = require('./utils.js');

function identifyCorrectHaiku() {
  const haiku1 = "Update the embed so it only includes the newest flash content";
  return utils.isHaiku(haiku1);
}

// incorrect number of syllables (14 instead of 17)
function identifyIncorrectHaiku1() {
  const nonHaiku1 = "Update the embed so it only includes the newest";
  return !utils.isHaiku(nonHaiku1);
}

// incorrect distribution of syllables across three lines (with correct # of syllables: 17)
function identifyIncorrectHaiku2() {
  const nonHaiku2 = "docs: add code comment to document use of 'muted' in video";
  return !utils.isHaiku(nonHaiku2);
}

// incorrect distribution of syllables (with incorrect # of syllables: 16)
function identifyIncorrectHaiku3() {
  const nonHaiku3 = "Found mechanics article Much was wrong / figured out a lot more.";
  return !utils.isHaiku(nonHaiku3);
}

function formatsTweetMessageCorrectly() {
  const haikuCommit = {
    tidy_message: 'Update the embed so it only includes the newest flash content',
    commit_url: 'https://example.com'
  };
  const expectedTweetMessage = `Update the embed
so it only includes the
newest flash content

https://example.com`;

  const tweetMessage = utils.formatTweetMessage(haikuCommit);

  return tweetMessage === expectedTweetMessage;
}

const tests = [
  identifyCorrectHaiku,
  identifyIncorrectHaiku1,
  identifyIncorrectHaiku2,
  identifyIncorrectHaiku3,
  formatsTweetMessageCorrectly
];

tests.forEach((test, index) => {
  if (test()) {
    console.log(`Test ${index} passed.`);
  } else {
    console.log(`Test ${index} failed.`);
  }
  console.log('');
});

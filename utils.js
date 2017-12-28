const syllable = require('syllable');

function getRelativeUTCDateString(daysAgo) {
  const date = new Date();
  const delta = daysAgo || 0;
  date.setDate(date.getDate() - delta);
  return date.toISOString().split('T')[0];
}

function tidyCommitMessage(message) {     // "commit message/n/nbody of message"
  return message.replace(/\n/g, " ")      // "commit message  body of message"
                .replace(/\s\s+/g, ' ');  // "commit message body of message"
}

function isHaiku(text) {
  const syllableCount = syllable(text);

  if (shouldRejectCommit(text)) {
    return false;
  }

  if (syllableCount !== 17) {
    return false;
  };

  if (splitIntoHaikuPhrases(text) === false) {
    return false;
  }

  return true;
}

/**
 * some commit messages are just too awkward to try and turn
 * into haikus, so we just reject them outright.
 */
function shouldRejectCommit(commitMessage) {
  const containsUrl = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?");
  if (containsUrl.test(commitMessage)) {
    return true;
  }
  return false;
}

/**
 * Splits a one-line sentance into haiku phrases, if possible.
 * @param {*} text
 * @return {Array|Boolean} returns an array containing the 3 haiku phrases,
 *                         or returns false, if it cannot be split into phrases.
 */
function splitIntoHaikuPhrases(text) {
  const wordsArray = text.split(' ');

  let phrase1 = wordsArray.shift();
  while (syllable(phrase1) < 5 && wordsArray.length !== 0) {
    phrase1 += ` ${wordsArray.shift()}`;
  }
  if (syllable(phrase1) !== 5) {
    return false;
  }

  let phrase2 = wordsArray.shift();
  while (syllable(phrase2) < 7 && wordsArray.length !== 0) {
    phrase2 += ` ${wordsArray.shift()}`;
  }
  if (syllable(phrase2) !== 7) {
    return false;
  }

  let phrase3 = wordsArray.shift();
  while (syllable(phrase3) < 5 && wordsArray.length !== 0) {
    phrase3 += ` ${wordsArray.shift()}`;
  }
  if (syllable(phrase3) !== 5) {
    return false;
  }

  return [phrase1, phrase2, phrase3];
}

function formatTweetMessage(haikuCommit) {
  const haikuPhrases = splitIntoHaikuPhrases(haikuCommit.tidy_message);
  return `${haikuPhrases[0]}
${haikuPhrases[1]}
${haikuPhrases[2]}

${haikuCommit.commit_url}`;
}

module.exports = {
  getRelativeUTCDateString: getRelativeUTCDateString,
  tidyCommitMessage: tidyCommitMessage,
  shouldRejectCommit: shouldRejectCommit,
  isHaiku: isHaiku,
  formatTweetMessage: formatTweetMessage
};

const syllable = require('syllable');
const GitHubApi = require('github');
var Twit = require('twit');

// // Dev API settings.
// const github = new GitHubApi({
//   debug: true
// });

var github = new GitHubApi({
  timeout: 5000,
  host: 'api.github.com',
  protocol: 'https',
  headers: {
    'accept': 'application/vnd.github.cloak-preview'
  },
  rejectUnauthorized: false,
})

var T = new Twit({
  consumer_key:         process.env.CONSUMER_KEY,
  consumer_secret:      process.env.CONSUMER_SECRET,
  access_token:         process.env.ACCESS_TOKEN,
  access_token_secret:  process.env.ACCESS_TOKEN_SECRET,
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
})

function run(args) {
  const daysAgo = (args && args.daysAgo) || 1;
  console.log('the bot is running');
  getCommitsAsync(daysAgo)
    .then((response) => {
      const commits = response.data.items.map(item => ({
        message: item.commit.message,
        tidy_message: tidyCommitMessage(item.commit.message),
        commit_url: item.html_url,
        timestamp: item.commit.committer.date
      }));

      console.log('Commits:');
      console.log(commits);

      // @todo: instead of filtering all the commits, we could loop until we find
      //        a valid one and exit once we do.
      const haikus = commits.filter((commit) => {
        return isHaiku(commit.tidy_message);
      });

      console.log('Haikus:');
      console.log(haikus);

      if (haikus.length === 0) {
        throw 'No valid Haikus found (in the first 100 commits)';
      }
      return haikus[0];
    })
    .then((haiku) => {
      console.log('the chosen haiku:', haiku);
      const tweet = `${haiku.tidy_message} ${haiku.commit_url}`;
      T.post('statuses/update', { status: tweet }, function(err, data, response) {
        console.log(data);
      });
    })
    .catch((error) => {
      console.log("Promise Rejected");
      console.log(error);
    });
}

function getCommitsAsync(daysAgo) {
  const dateRange = `${getRelativeUTCDateString(daysAgo + 1)}..${getRelativeUTCDateString(daysAgo)}`
  console.log('Date Range:');
  console.log(dateRange);
  return github.search.commits({
    q: `is:public+committer-date:${dateRange}+merge:false`,
    sort: 'committer-date',
    per_page: '100'
  });
}

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
  console.log(`Syllable count: ${syllableCount}`);

  if (shouldRejectCommit(text)) {
    return false;
  }

  if (syllableCount !== 17) {
    return false;
  };

  if (splitIntoHiakuPhrases(text) === false) {
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
function splitIntoHiakuPhrases(text) {
  const wordsArray = text.split(' ');

  let phrase1 = wordsArray.shift();
  while (syllable(phrase1) < 5) {
    phrase1 += ` ${wordsArray.shift()}`;
  }
  if (syllable(phrase1) !== 5) {
    return false;
  }

  let phrase2 = wordsArray.shift();
  while (syllable(phrase2) < 7) {
    phrase2 += ` ${wordsArray.shift()}`;
  }
  if (syllable(phrase2) !== 7) {
    return false;
  }

  let phrase3 = wordsArray.shift();
  while (syllable(phrase3) < 5) {
    phrase3 += ` ${wordsArray.shift()}`;
  }
  if (syllable(phrase3) !== 5) {
    return false;
  }

  return [phrase1, phrase2, phrase3];
}

module.exports = {
  run: run,
  isHaiku: isHaiku
};
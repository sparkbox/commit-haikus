const GitHubApi = require('github');
const Twit = require('twit');
const utils = require('./utils');

// // Dev API settings.
// const github = new GitHubApi({
//   debug: true
// });

const github = new GitHubApi({
  timeout: 5000,
  host: 'api.github.com',
  protocol: 'https',
  headers: {
    'accept': 'application/vnd.github.cloak-preview'
  },
  rejectUnauthorized: false,
})

const T = new Twit({
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
    .then(handleResponse)
    .then((haikuCommit) => {
      const tweetMessage = utils.formatTweetMessage(haikuCommit);
      console.log('');
      console.log(tweetMessage);
      T.post('statuses/update', { status: tweetMessage }, function(err, data, response) {
        console.log(data);
      });
    })
    .catch((error) => {
      console.log("Promise Rejected");
      console.log(error);
    });
}

function getCommitsAsync(daysAgo) {
  const dateRange = `${utils.getRelativeUTCDateString(daysAgo + 1)}..${utils.getRelativeUTCDateString(daysAgo)}`
  console.log('Date Range:');
  console.log(dateRange);
  return github.search.commits({
    q: `is:public+committer-date:${dateRange}+merge:false`,
    sort: 'committer-date',
    per_page: '100'
  });
}

function handleResponse(response) {
  const commits = response.data.items.map(item => ({
    message: item.commit.message,
    tidy_message: utils.tidyCommitMessage(item.commit.message),
    commit_url: item.html_url,
    timestamp: item.commit.committer.date
  }));

  // @todo: instead of filtering all the commits, we could loop until we find
  //        a valid one and exit once we do.
  const haikus = commits.filter((commit) => {
    return utils.isHaiku(commit.tidy_message);
  });

  if (haikus.length === 0) {
    console.log('No valid Haikus found (in this batch of commits)');
    if (github.hasNextPage(response)) {
      return github.getNextPage(response)
        .then(handleResponse)
    } else {
      throw 'No valid Haikus found across all pages of results.'
    }
  }

  return haikus[0];
}

module.exports = {
  run: run
};
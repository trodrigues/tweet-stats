var Twitter = require('twitter');
var _ = require('lodash');
var fs = require('fs')

const consumerKey = '';
const consumerSecret = '';
const accessToken = '';
const accessTokenSecret = '';

var client = new Twitter({
  consumer_key: consumerKey,
  consumer_secret: consumerSecret,
  access_token_key: accessToken,
  access_token_secret: accessTokenSecret
});

// Remove or comment out the following "getHomeAndConcat" calls to retrieve less tweets (200 per call)
// Don't bother doing more than 4 because this API only returns up to 800 tweets
getHomeAndConcat()
.then(r => getHomeAndConcat(r.tweets, r.max_id))
.then(r => getHomeAndConcat(r.tweets, r.max_id))
.then(r => getHomeAndConcat(r.tweets, r.max_id))

.then(r => writeToFile(r.tweets))

.catch((err, response) => {
  console.log(err, response);
  throw err;
})

function getHome(params={}) {
  params.exclude_replies = false;
  params.trim_user = false;
  params.count = 200;
  return new Promise((resolve, reject) => {
    client.get('statuses/home_timeline', params, (err, tweets, response) => {
      if (err) reject({err: err, response: response});
      else resolve(tweets);
    });
  })
}

function getHomeAndConcat(tweets=[], max_id) {
  const params = {}
  if(max_id) {
    params.max_id = max_id;
  }
  return getHome(params)
  .then(responseTweets => {
    const max_id = responseTweets[responseTweets.length-1].id
    return {
      tweets: tweets.concat(responseTweets),
      max_id: max_id
    }
  })
}

function writeToFile(tweets) {
  console.log('tweets', tweets.length);
  const users = _.map(tweets, 'user.screen_name');
  console.log('plucked users', users.length);
  const sums = _.reduce(users, (sums, t) => {
    if (sums[t]) {
      sums[t].count++;
    } else {
      sums[t] = {
        user: t,
        count: 1
      };
    }
    return sums;
  }, {})
  console.log('summed length', Object.keys(sums).length)
  const ordered = _.orderBy(sums, ['count'], ['asc']);
  console.log('sum of counts', _.sum(_.map(ordered, 'count')))
  const str = _.reduce(ordered, (str, t) => {
    return str + t.count + ' - http://twitter.com/' + t.user + '\n';
  }, '');
  console.log(str);
  fs.writeFileSync('counts.txt', str);
}

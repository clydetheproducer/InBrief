const Service = require('./Service');
const TwitterClient = require('twitter');

class Twitter extends Service {
  constructor(config) {
    super('twitter',config);
    this.client = new TwitterClient({
      'consumer_key': this.config.credentials.consumer.key,
      'consumer_secret': this.config.credentials.consumer.secret,
      'access_token_key': this.config.credentials.access.token,
      'access_token_secret': this.config.credentials.access.tokenSecret
    });
  }

  exec() {
    const tweetStreams = [];
    const start = (i) => {
      if (i < this.config.lists.length) {
        return this.queryList(i)
          .then((tweets) => {
            tweetStreams.push(tweets);
            return this.thenSleep(null,100);
          })
          .then(() => {
            return start(i + 1);
          })
      } else {
        return tweetStreams;
      }
    }
    return start(0);
  }

  queryList(i) {
    return new Promise((resolve,reject) => {
      const params = {
        'owner_screen_name': this.config.lists[i].owner,
        'slug': this.config.lists[i].slug
      };
      this.client.get('lists/statuses',params,(err,tweets) => {
        console.log(err)
        if (err) {
          reject(err);
        } else {
          resolve(tweets);
        }
      });
    });
  }

}

module.exports = Twitter;

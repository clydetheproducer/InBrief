const Service = require('./Service');
const request = require('request');
const FeedParser = require('feedparser');
const url = require('url');

class RSS extends Service {
  constructor(config) {
    super('rss',config);
  }

  exec() {
    return Promise.all(
      this.config.sets.map((set) => {
        return Promise.all(
          set.feeds.map((feed) => {
            return new Promise((resolve,reject) => {
              const items = [];
              const req = request({
                'uri': feed,
                'timeout': 5000
              })
              const feedparser = new FeedParser();
              req.on('error',(err) => reject(err));
              feedparser.on('error',(err) => reject(err));
              req.on('response', function(res) {
                var stream = this;
                if (res.statusCode === 200) {
                  stream.pipe(feedparser);
                } else {
                  resolve([]);
                }
              });
              feedparser.on('readable',function() {
                var stream = this;
                var item;
                while (item = stream.read()) {
                  items.push(item);
                }
              });
              feedparser.on('end',function() {
                resolve(items);
              });
            })
              .catch((err) => this.handleSubError(err));
          })
        )
          .then((unmergedItems) => {
            const items = [];
            unmergedItems.forEach((_items) => {
              if (_items) {
                _items.forEach((item) => items.push(item));
              }
            });
            const parsedUrls = {};
            items.forEach((item) => {
              parsedUrls[item.link] = url.parse(item.link);
            })
            for(let i = 0; i < items.length; i++) {
              const item = items[i];
              const j = items.findIndex((_item) => {
                return parsedUrls[item.link].hostname == parsedUrls[_item.link].hostname && item.title === _item.title;
              });
              if (j >= 0 && j !== i) {
                items.splice(j,1);
              }
            }
            items.sort((a,b) => {
              if (a.pubDate && b.pubDate) {
                return b.pubDate.getTime() - a.pubDate.getTime();
              } else if (a.pubDate) {
                return -1;
              } else if (b.pubDate) {
                return 1;
              } else {
                return 0;
              }
            });
            return {
              'title': set.title,
              'items': items.slice(0,this.config.max).map((item) => {
                return {
                  'title': item.title,
                  'date': item.pubDate,
                  'link': item.link,
                  'website': url.parse(item.link).hostname.replace('www.',''),
                  'author': item.author
                };
              })
            }
          })
      })
    )
      .then((data) => {
        return {
          'type': 'rss',
          data
        };
      })
  }
}

module.exports = RSS;

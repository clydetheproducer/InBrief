import React from 'react';
import Widget from './Widget';
import './Twitter.css';
import {
  formatDate
} from '../util';

export default class Twitter extends Widget {
  constructor(props) {
    super('Twitter','twitter',props);
  }

  getMainClassNames() {
    return super.getMainClassNames().concat(['widget-scroll']);
  }

  renderWidget() {
    return (
      <div>
        {
          this.state.data && this.state.data.map((tweets,i) => this.renderTweets(tweets,i))
        }
      </div>
    );
  }

  prepareTweetText(tweet) {
    let text = tweet.text;
    if (tweet.entities && tweet.entities.urls) {
      tweet.entities.urls.forEach((url) => {
        text = text.replace(url.url,'<a target="_blank" href="' + url.url + '">' + url.display_url + '</a>');
      });
    }
    if (tweet.extended_entities && tweet.extended_entities.media) {
      tweet.extended_entities.media.forEach((url) => {
        text = text.replace(url.url,'<a target="_blank" href="' + url.url + '">' + url.display_url + '</a>');
      });
    }
    return text;
  }

  renderTweets(tweets,i) {
    return (
      <div className="twitter-feed" key={i}>
        <div className="twitter-feed-title widget-subhead">
          {tweets.title}
        </div>
        <div className="twitter-feed-tweets">
          {
            tweets.tweets.slice(0,10).map((tweet,j) => {
              return (
                <div className="twitter-feed-tweet striped" key={j}>
                  <img className="twitter-feed-tweet-profile-image" alt={'Twitter profile image for ' + tweet.user.screen_name} src={tweet.user.profile_image_url_https} />
                  <div className="twitter-feed-tweet-header">
                    <span className="twitter-feed-tweet-name">
                      {tweet.user.name}
                    </span>
                    <span className="twitter-feed-tweet-date">
                      {formatDate(tweet.created_at)}
                    </span>
                  </div>
                  <div className="twitter-feed-tweet-text" dangerouslySetInnerHTML={{__html: this.prepareTweetText(tweet)}}></div>

                </div>
              )
            })
          }
        </div>
      </div>
    )
  }
}

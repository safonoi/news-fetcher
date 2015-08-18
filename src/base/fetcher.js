import request from 'request';
import FeedParser from 'feedparser';
import assert from 'assert';
import validator from 'validator';
import events from 'events';
var EventEmitter = events.EventEmitter;

import {Storage} from './storage';

/**
 * Base fetcher class
 * Implements base functional for all fetchers such as get rss content, parse it, pre-format
 */
export class Fetcher extends EventEmitter {
  /**
   * Create fetcher instance
   * @constructor
   * @param {string} url Rss feed url
   * @param {object} storage Instance of the child of Storage class
   * @throws {AssertionError}
   */
  constructor(url, storage) {
    assert.ok(validator.isURL(url), 'url param must be a valid url');
    assert.ok(storage instanceof Storage, 'url param must be a valid url');
    super();

    this.url = url;
    this.storage = storage;
  }

  /**
   * Get content from the feed
   * Emits events: 'error'
   * @returns {object} {meta: 'Meta informations of the feed', articles: 'list of articles'}
   */
  getFeedContent() {
    var self = this;

    var feedparser = new FeedParser();
    feedparser.on('error', function(error) {
      self.emit('error', error);
    });

    var req = request(this.url);
    req.on('error', function (error) {
      self.emit('error', error);
    });

    req.on('response', function (res) {
      if (res.statusCode != 200)
        return this.emit('error', new Error('Wrong status code ' + res.statusCode));
      // Redirect stream from req to feedparser
      this.pipe(feedparser);
    });

    // feedparser will be ready to send data when it emits 'readable' event
    feedparser.on('readable', function() {
      var fetchedArticles = [];
      // Get the first article
      var article = this.read();
      while (article) {
        fetchedArticles.push(article);
        article = this.read();
        break;
      }
      return {meta: this.meta, articles: fetchedArticles};
    });
  }
}

import request from 'request';
import FeedParser from 'feedparser';
import assert from 'assert';
import validator from 'validator';
import events from 'events';
import _ from 'underscore';
var EventEmitter = events.EventEmitter;

import {Storage} from './storage';

/**
 * Base fetcher class
 * Implements base functional for all fetchers such as get rss content, parse it, pre-format
 */
export class Fetcher extends EventEmitter {
  /**
   * @constructor
   * @param {string} url Rss feed url
   * @param {object} storage Instance of the child of Storage class
   * @throws {AssertionError}
   */
  constructor(url, storage) {
    assert.ok(validator.isURL(url), 'url param must be a valid url');
    assert.ok(storage instanceof Storage, 'storage must be an instance of Storage');
    super();

    /**
     * Feed url address
     * @type {string}
     */
    this.url = url;
    /**
     * Storage that is related with this fetcher
     * @type {Storage}
     */
    this.storage = storage;
    /**
     * Identifier of the fetcher (it's used by storage)
     * @type {number}
     */
    this.id = 'default';
  }

  /**
   * Get data from feed url
   * @param {object} pipeTarget Where we'll redirect the response flow
   * @private
   */
  _getData(pipeTarget) {
    var self = this;
    var req = request(this.url);
    req.on('error', function (error) {
      self.emit('error', error);
    });

    req.on('response', function (res) {
      if (res.statusCode != 200)
        return this.emit('error', new Error('Wrong status code ' + res.statusCode));
      // Redirect stream from req to feedparser
      this.pipe(pipeTarget);
    });
  }

  /**
   * Get content from the feed
   * Emits events: 'error'
   * @throws {AssertionError}
   * @returns {object} {meta: 'Meta informations of the feed', articles: 'list of articles'}
   */
  getFeedContent(callback) {
    var self = this;
    assert.ok(typeof(callback) === 'function', 'callback is required');
    var feedparser = new FeedParser();
    feedparser.on('error', function(error) {
      self.emit('error', error);
    });

    this._getData(feedparser);

    var fetchedArticles = [];

    // feedparser will be ready to send data when it emits 'readable' event
    feedparser.on('readable', function() {
      // Get the first article
      var article = this.read();
      while (article) {
        fetchedArticles.push(article);
        article = this.read();
        break;
      }
    });
    // When feedparser finish getting data from feed we'll call user callback
    feedparser.on('end', function(){
      callback(null, {meta: this.meta, articles: fetchedArticles});
    });
  }

  /**
   * Format list of fetched articles
   * @param {array} articles List of articles
   * @param {object} meta Meta feed information
   * @throws {AssertionError}
   * @returns {array} List of formatted articles
   */
  format(articles, meta = null) {
    assert.ok(_.isArray(articles), 'articles param must be an array');
    var formattedArticles = [];
    _.each(articles, function(curArticle) {
      formattedArticles.push({
        guid: curArticle.guid,
        title: curArticle.title,
        description: curArticle.description,
        pubDate: curArticle.pubDate
      });
    });
    return formattedArticles;
  }

  /**
   * Save articles in the storage
   * @param {array} articles List of articles
   * @throws {AssertionError}
   */
  saveArticles(articles) {
    assert.ok(_.isArray(articles), 'articles param must be an array');
    this.storage.saveArticles(this.id, articles);
  }
}

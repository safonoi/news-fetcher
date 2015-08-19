import request from 'request';
import FeedParser from 'feedparser';
import assert from 'assert';
import validator from 'validator';
import events from 'events';
import crypto from 'crypto';
import async from 'async';
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
   * Get id of the article
   * @param {object} article
   * @returns {*|string}
   */
  getArticleId(article) {
    var md5 = crypto.createHash('md5');
    md5.update(article.guid);
    return md5.digest('hex');
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
    async.waterfall([
        // Get id of the last saved article
        function(callback) {
          self.storage.getLastId(self.id, callback);
        },
        // Fetch articles from the feed
        function(lastArticleId, callback) {
          var isOldArticle = false;
          // All articles that were fetched from feed
          var fetchedArticles = [];
          // feedparser will be ready to send data when it emits 'readable' event
          feedparser.on('readable', function() {
            // Get the first article
            var article = this.read();
            while (article) {
              // If this article has been already parsed ignore rest of articles
              if(lastArticleId && self.getArticleId(article) === lastArticleId)
                isOldArticle = true;
              if(!isOldArticle) {
                fetchedArticles.push(article);
                article = this.read();
              }
              else
                break;
            }
          });
          // When feedparser finishes getting data from feed we'll call user callback
          feedparser.on('end', function(){
            // Save id of the last (newest) article from feed
            if(fetchedArticles.length)
              self.storage.setLastId(self.id, self.getArticleId(fetchedArticles[0]));
            callback(null, {meta: this.meta, articles: fetchedArticles});
          });
        }
      ],
      function(err, data) {
        callback(err, data);
      });
  }

  /**
   * Format list of fetched articles
   * @param {array} articles List of articles
   * @param {object} meta Meta feed information
   * @param {function} decorator Format article function
   * @throws {AssertionError}
   * @returns {array} List of formatted articles
   */
  format(articles, meta = null, decorator = null) {
    assert.ok(_.isArray(articles), 'articles param must be an array');
    if(decorator)
      assert.ok(typeof(decorator) === 'function', 'decorator must be a function');

    decorator = decorator? decorator : function(article) {
      return {
        guid: article.guid,
        title: article.title,
        description: article.description,
        pubDate: article.pubDate
      };
    };
    return _.map(articles, decorator);
  }

  /**
   * Save articles in the storage
   * @param {array} articles List of articles
   * @throws {AssertionError}
   */
  saveArticles(articles) {
    assert.ok(_.isArray(articles), 'articles param must be an array');
    this.storage.save(this.id, articles);
  }

  /**
   * Fetch, format and save new articles from feed
   * @param {function} callback User's callback function
   * @throws {AssertionError}
   */
  launch(callback = function(){}) {
    assert.ok(typeof(callback) === 'function', 'callback must be a function');
    var self = this;
    self.getFeedContent(function(err, data){
      var articles = self.format(data.articles, data.meta);
      self.saveArticles(articles);
      callback(null);
    });
  }
}

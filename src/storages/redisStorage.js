import assert from 'assert';
import validator from 'validator';
import redis from 'redis';
import _ from 'underscore';
import util from 'util';
import {Storage} from '../base/storage';

export class RedisStorage extends Storage {
  /**
   * @constructor
   * @param {object} config
   */
  constructor(config){
    super(config);
  }

  /**
   * Get redis key for last id of the article record
   * @param {number} fetcherId
   * @returns {string}
   * @private
   */
  _getLastIdKey(fetcherId) {
    return 'last_id:' + fetcherId;
  }

  /**
   * Create connection
   * @param {function} callback User callback function(err, connection){...}
   */
  openConnection(callback){
    super.openConnection(callback);
    var self = this;
    var redisClient = redis.createClient(
      this.config.port,
      this.config.host,
      this.config.params
    ).on('error', function(err) {
        self.emit('error', err);
      });

    this.connection = redisClient;

    if(this.config.pass !== undefined) {
      this.connection.auth(this.config.pass, function(err) {
        if(err) {
          callback(err);
          return;
        }
        if(this.config.db !== undefined)
          this.connection.select(redisDbName);
        callback(null, self);
      });
    }
    else {
      callback(null, self);
    }
  }

  /**
   * Close connection
   * @param {function} callback User callback function(err){...}
   */
  closeConnection(callback = function(){}) {
    super.closeConnection(callback);
    this.connection.quit();
    callback(null);
  }

  /**
   * Save articles
   * @param {string} fetcherId
   * @param {number} articles
   * @param {function} callback User callback function(err){...}
   */
  save(fetcherId, articles, callback = function(){}) {
    super.save(fetcherId, articles, callback);
    articles = _.each(articles, function(curArticle){
      curArticle = JSON.stringify(curArticle);
    });
    this.connection.rpush.apply(this.connection, [fetcherId].concat(articles).concat([callback]));
  }

  /**
   * Set id of the last fetched article
   * @param {number} fetcherId
   * @param {number} articleId
   * @param {function} callback User callback function(err){...}
   */
  setLastId(fetcherId, articleId, callback = function(){}) {
    super.setLastId(fetcherId, articleId, callback);
    this.connection.set(this._getLastIdKey(fetcherId), articleId, callback);
  }

  /**
   * Get id of the last fetched article
   * @param {number} fetcherId
   * @param {function} callback User callback function(err, result){...}
   */
  getLastId(fetcherId, callback) {
    super.getLastId(fetcherId, callback);
    this.connection.get(this._getLastIdKey(fetcherId), callback);
  }
}

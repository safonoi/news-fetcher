import assert from 'assert';
import validator from 'validator';
import redis from 'redis';
import _ from 'underscore';
import util from 'util';
import {Storage} from '../base/storage';

export class RedisStorage extends Storage {
  /**
   * @constructor
   */
  constructor(config){
    super(config);
  }

  /**
   * Create connection
   * @param {function} callback User callback function(err, connection){...}
   */
  createConnection(callback){
    super.createConnection(callback);
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
  saveArticles(fetcherId, articles, callback = function(){}) {
    super.saveArticles(fetcherId, articles, callback);
    var articles = _.each(articles, function(curArticle){
      curArticle = JSON.stringify(curArticle);
    });
    this.connection.rpush.apply(this.connection, [fetcherId].concat(articles).concat([callback]));
  }
}

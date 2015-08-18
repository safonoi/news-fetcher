import assert from 'assert';
import validator from 'validator';
import redis from 'redis';
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
        callback(null, this.connection);
      });
    }
    else {
      callback(null, this.connection);
    }
  }

  /**
   * Close connection
   * @param {function} callback User callback function(err){...}
   */
  closeConnection(callback) {
    super.closeConnection(callback);
    this.connection.quit();
    callback(null);
  }

  /**
   * Add articles
   * @param {number} articles
   */
  addArticles(articles) {
    super.addArticles(articles);
    throw new Error('Must be implemented!');
  }
}

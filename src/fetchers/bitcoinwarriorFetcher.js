import assert from 'assert';
import validator from 'validator';
import {RedisStorage} from '../storages/redisStorage';
import {Fetcher} from '../base/fetcher';

export class BitcoinwarriorFetcher extends Fetcher {
  /**
   * @constructor
   */
  constructor(storage) {
    super('http://bitcoinwarrior.net/feed/', storage);
    this.id = 'bitcoinwarrior';
  }

  /**
   * Format list of fetched articles
   * @param {array} articles List of articles
   * @param {object} meta Meta feed information
   * @throws {AssertionError}
   * @returns {array} List of formatted articles
   */
  format(articles, meta) {
    return super.format(articles, meta);
  }
}

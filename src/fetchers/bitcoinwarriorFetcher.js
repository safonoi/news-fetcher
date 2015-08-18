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
    this.FEED_ID = 'bitcoinwarrior';
  }
}

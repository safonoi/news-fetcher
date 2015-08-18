import util from 'util';
import config from 'config';
import async from 'async';
import {Fetcher} from './base/fetcher';
import {Storage} from './base/storage';
import {BitcoinwarriorFetcher} from './fetchers/bitcoinwarriorFetcher';
import {RedisStorage} from './storages/redisStorage';

async.waterfall([
  // Create instance of redis storage
  function(callback) {
    var redisStorage =  new RedisStorage(config.storages.redis);
    redisStorage.on('error', function(err){
      console.log(err);
    });
    redisStorage.createConnection(callback);
  },

  // Create instance of fetcher
  function(redisStorage, callback) {
    var fetcher = new BitcoinwarriorFetcher(redisStorage);
    fetcher.on('error', function(err){
      console.log('Oh! We\'ve got an error! ' + err);
    });
    callback(null, fetcher, redisStorage);
  },

  // Get articles from feed and save them
  function(fetcher, redisStorage, callback) {
    fetcher.getFeedContent(function(err, data){
     var articles = fetcher.format(data.articles, data.meta);
     fetcher.saveArticles(articles, callback);
     redisStorage.closeConnection();
    });
  }
],
  function(err, result){
    if(err)
      console.log(err);
});




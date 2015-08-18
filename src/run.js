import util from 'util';
import config from 'config';
import {Fetcher} from './base/fetcher';
import {Storage} from './base/storage';
import {BitcoinwarriorFetcher} from './fetchers/bitcoinwarriorFetcher';
import {RedisStorage} from './storages/redisStorage';

var redisStorage =  new RedisStorage(config.storages.redis);
redisStorage.on('error', function(err){
  console.log(err);
});

redisStorage.createConnection(function(err, connection){
  if(err)
    console.log(err);
  console.log('Connection was created successfully');
  redisStorage.closeConnection(function(err){
    if(err)
      console.log(err);
  });
});

var fetcher = new BitcoinwarriorFetcher(redisStorage);

fetcher.on('error', function(err){
  console.log('Oh! We\'ve got an error! ' + err);
});

fetcher.getFeedContent(function(err, data){
  var articles = fetcher.format(data.articles, data.meta);
  console.log(articles);
});


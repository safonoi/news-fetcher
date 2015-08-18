import util from 'util';
import config from 'config';
import {Fetcher} from './base/fetcher';
import {Storage} from './base/storage';

var fetcher = new Fetcher('http://bitcoinwarrior.net/feed/', new Storage());

fetcher.on('error', function(err){
  console.log('Oh! We\'ve got an error! ' + err);
});

fetcher.getFeedContent(function(err, data){
  var articles = fetcher.format(data.articles, data.meta);
  console.log(articles);
});


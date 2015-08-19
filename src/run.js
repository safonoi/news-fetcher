import util from 'util';
import config from 'config';
import async from 'async';
import _ from 'underscore';
//import {Fetcher} from './base/fetcher';
//import {Storage} from './base/storage';


/**
 * Log function
 * @param {mixed} message
 * @param {boolean} _isError
 * It would be better to implement more powerfull functional
 */
function log (message, _isError = false){
  if(config.debug || _isError){
    console.log(message);
  }
}

/**
 * Init main flow
 * @param {function} callback
 */
function init(callback) {
  log('Init application');
  callback(null, {storages: null, fetchers: null});
}

/**
 * Load storages and open their connections
 * @param {object} commonData
 * @param {function} callback
 */
function loadStorages(commonData, callback) {
  log('Loading storages ..');
  commonData.storages = {};
  async.forEachOf(config.storages,
    function(storageConfig, storageName, callback){
      log(`Loading ${storageName} ..`);
      var StorageClass = require('./storages/' + storageConfig.class);
      var storage = new StorageClass[storageConfig.class](storageConfig);
      storage.on('error', function(err){
        log(err, true);
      });
      storage.openConnection(function(err){
        log(`Creating connection to the ${storageName} ..`);
        if(err)
          callback(err, commonData);
        else {
          commonData.storages[storageName] = storage;
          callback(null);
        }
      });
    },
    function(err){
      callback(err, commonData);
    });
}

/**
 * Load fetchers and init them by the related storage
 * @param {object} commonData
 * @param {function} callback
 */
function loadFetchers(commonData, callback) {
  log('Loading fetchers ..');
  commonData.fetchers = {};
  async.forEachOf(config.fetchers,
    function(fetcherConfig, fetcherName, callback){
      log(`Loading ${fetcherName} ..`);
      var FetcherClass = require('./fetchers/' + fetcherConfig.class);

      var fetcher = new FetcherClass[fetcherConfig.class](commonData.storages[fetcherConfig.storage]);
      fetcher.on('error', function(err){
        log(err, true);
      });
      commonData.fetchers[fetcherName] = fetcher;
      callback(null);
    },
    function(err){
      callback(err, commonData);
    });
}

/**
 * Launch each fetcher (get, format and save new articles)
 * @param {object} commonData
 * @param {function} callback
 */
function launchFetchers(commonData, callback) {
  log('Launch fetchers ..');
  async.map(Object.keys(commonData.fetchers), function(fetcherName, callback){
    log(`Launch ${fetcherName} ..`);
    var fetcher = commonData.fetchers[fetcherName];
    fetcher.launch(callback);
  }, function(err, results){
    _.each(results, function(curResult){
      log(`${curResult[0]} has fethced ${curResult[1]} articles`);
    });
    callback(err, commonData);
  });
}

/**
 * Finish of the main flow
 * @param {object} commonData
 */
function finish(commonData) {
  // Close all connections of the storages
  _.each(commonData.storages, function(storage){
    storage.closeConnection();
  });
}

// Main flow
async.waterfall([
  init,
  loadStorages,
  loadFetchers,
  launchFetchers
], function(err, commonData){
  finish(commonData);
});

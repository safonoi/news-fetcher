import util from 'util';
import config from 'config';
import async from 'async';
import _ from 'underscore';
import {CronJob} from 'cron';

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
      var StorageClass = require('./storages/' +
        storageConfig.class.charAt(0).toLowerCase() + storageConfig.class.substr(1));
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
      var FetcherClass = require('./fetchers/' +
        fetcherConfig.class.charAt(0).toLowerCase() + fetcherConfig.class.substr(1));

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
 * Set cron for launching each fetcher (get, format and save new articles)
 * @param {object} commonData
 * @param {function} callback
 */
function setCronsForFetchers(commonData, callback) {
  log('Setting cron jobs for fetchers ..');
  commonData.jobs = [];
  async.each(Object.keys(commonData.fetchers), function(fetcherName, callback){
    var fetcher = commonData.fetchers[fetcherName];
    // Set cron for cur fetcher and start it
    var job = new CronJob(config.fetchers[fetcherName].interval,
      // Job function
      function() {
        log(`Launch ${fetcherName} ..`);
        fetcher.launch(function(err, result){
          log(`${result[0]} has fethced ${result[1]} articles`);
        });
      }
    );
    commonData.jobs.push(job);
    callback(null);
  }, function(err){
    callback(err, commonData);
  });
}

/**
 * Start each cron
 * @param {object} commonData
 * @param {function} callback
 */
function startCrons(commonData, callback) {
  log('Starting cron jobs ..');
  _.each(commonData.jobs, function(job){
    job.start();
  });
  callback(null, commonData);
}

/**
 * Finish of the main flow
 * @param {object} commonData
 */
function finish(commonData) {
  log('Finishing working ..');
  log('Stopping cron jobs ..');
  _.each(commonData.jobs, function(job){
    job.stop();
  });
  log('Closing connections ..');
  // Close all connections of the storages
  _.each(commonData.storages, function(storage){
    storage.closeConnection();
  });
}

// Main flow
function run() {
  async.waterfall([
    init,
    loadStorages,
    loadFetchers,
    setCronsForFetchers,
    startCrons
  ], function (err, commonData) {
    // Restarting flow for close and reopen connections of the storages
    new CronJob(config.restartInterval, function(){
      finish(commonData);
      log('Restarting main flow ..');
      run();
    }).start();
  });
}
run();

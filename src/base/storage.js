import assert from 'assert';
import validator from 'validator';
import events from 'events';
import _ from 'underscore';
var EventEmitter = events.EventEmitter;

/**
 * Base class for storages of the articles
 */
export class Storage extends EventEmitter {
  /**
   * @constructor
   * @throws {AssertionError}
   */
  constructor(config) {
    super();
    assert.ok(config, 'config is required');
    this.connection = null;
    this.config = config;
  }

  /**
   * Create connection
   * @param {function} callback User callback function(err, connection){...}
   * @throws {AssertionError}
   * must be implemented in the child
   */
  openConnection(callback = function(){}) {
    assert.ok(typeof(callback) === 'function', 'callback must be a function');
  }

  /**
   * Close connection
   * @param {function} callback User callback function(err, connection){...}
   * @throws {AssertionError}
   * must be implemented in the child
   */
  closeConnection(callback = function(){}) {
    assert.ok(typeof(callback) === 'function', 'callback must be a function');
  }

  /**
   * Set id of the last fetched item
   * @param {number} fetcherId
   * @param {number} articleId
   * @param {function} callback User callback function(err){...}
   * @throws {AssertionError}
   * must be implemented in the child
   */
  setLastId (fetcherId, articleId,  callback = function(){}) {
    assert.ok(fetcherId, 'fetcherId is required');
    assert.ok(articleId, 'articleId is required');
    assert.ok(typeof(callback) === 'function', 'callback must be a function');
  }

  /**
   * Get id of the last fetched article
   * @param {number} fetcherId
   * @param {function} callback User callback function(err, result){...}
   * must be implemented in the child
   */
  getLastId (fetcherId, callback = function(){}) {
    assert.ok(fetcherId, 'fetcherId is required');
    assert.ok(typeof(callback) === 'function', 'callback must be a function');
  }

  /**
   * Save articles
   * @param {string} fetcherId
   * @param {number} articles
   * @param {function} callback User callback function(err){...}
   * @throws {AssertionError}
   * must be implemented in the child
   */
  save(fetcherId, articles, callback = function(){}) {
    assert.ok(fetcherId, 'fetcherId is required');
    assert.ok(_.isArray(articles), 'articles param must be an array');
    assert.ok(typeof(callback) === 'function', 'callback must be a function');
  }
}

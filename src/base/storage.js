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
  createConnection(callback) {
    assert.ok(typeof(callback) === 'function', 'callback is required');
  }

  /**
   * Close connection
   * @param {function} callback User callback function(err, connection){...}
   * @throws {AssertionError}
   * must be implemented in the child
   */
  closeConnection(callback) {
    assert.ok(typeof(callback) === 'function', 'callback is required');
  }

  /**
   * Save id of the last fetched item
   * @param {number} fetcherId
   * @param {number} articleId
   * must be implemented in the child
   */
  saveLastId (fetcherId, articleId) {
    throw new Error('Must be implemented!');
  }

  /**
   * Get id of the last fetched article
   * @param {number} fetcherId
   * must be implemented in the child
   */
  getLastId (fetcherId) {
    throw new Error('Must be implemented!');
  }

  /**
   * Add articles
   * @param {number} articles
   * @throws {AssertionError}
   * must be implemented in the child
   */
  addArticles(articles) {
    assert.ok(_.isArray(articles), 'articles param must be an array');
  }
}

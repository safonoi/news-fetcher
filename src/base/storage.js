import assert from 'assert';
import validator from 'validator';
import events from 'events';
var EventEmitter = events.EventEmitter;

/**
 * Base class for storages of the articles
 */
export class Storage extends EventEmitter {
  /**
   * @constructor
   */
  constructor() {
    super();
    this.connection = null;
  }

  /**
   * Create connection
   */
  createConnection() {
    throw new Error('Must be implemented!');
  }

  /**
   * Close connection
   */
  closeConnection() {
    throw new Error('Must be implemented!');
  }

  /**
   * Save id of the last fetched article
   * @param {number} fetcherId
   * @param {number} articleId
   */
  saveLastId (fetcherId, articleId) {
    throw new Error('Must be implemented!');
  }

  /**
   * Get id of the last fetched article
   * @param {number} fetcherId
   */
  getLastId (fetcherId) {
    throw new Error('Must be implemented!');
  }
}

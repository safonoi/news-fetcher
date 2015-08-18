module.exports = {
  // Debug mode
  debug: true,
  // How often will we fetch new data
  interval: '*/2 * * * *',
  // Settings of data storages
  storages: {
    redis: {
      host: 'localhost',
      port: 6379,
      pass: 'simplePass',
      params: {},
      db: 0
    },
    // You can implement other storage modules such as mongodb, mysql..
  }
};

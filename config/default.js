module.exports = {
  // Debug mode
  debug: true,
  // How often will we fetch new data
  interval: '*/2 * * * *',
  // Settings of data storages
  storages: {
    redis: {
      host: '127.0.0.1',
      port: 6379,
      pass: '',
      db: 0
    },
    // You can implement other storage modules such as mongodb, mysql, memcache..
  }
};

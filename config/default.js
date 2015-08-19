module.exports = {
  // Debug mode
  debug: true,
  // How often will we restart our fetchers
  restartInterval: '*/60 * * * * *',
  // Setting of the fetchers
  fetchers: {
    bitcoinwarriorFetcher: {
      // Class name of the fetcher
      class: 'BitcoinwarriorFetcher',
      // Where we will store fetched articles
      storage: 'redis',
      // How often will we fetch new articles
      interval: '*/5 * * * * *',
    }
  },
  // Settings of the data storages
  storages: {
    redis: {
      class: 'RedisStorage',
      host: 'localhost',
      port: 6379,
      pass: 'simplePass',
      params: {},
      db: 0
    },
    // You can implement other storage modules such as mongodb, mysql..
  }
};

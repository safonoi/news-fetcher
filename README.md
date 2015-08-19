<h2>Start</h2>
---
```
 $ npm install .
 $ grunt prod
```

<h2>Structure</h2>
---
- config/ - contains configs (default, production ..).
- src/ - scripts.
- src/base/ - base classes.
- src/fetchers/ - classes that implements fetcher for a specific site.
- src/storages/ - classes that implements article storage for a specific db (redis, mongo, mysql ..).
- run.js - input point. Main module that launches main work flow.
- .editorconfig - settings for your IDE.
- Gruntfile.js - tasks for grunt. It helps ease the process of development and allows to use modern technologies (such as es6).
- .gitignore - files and directories that do not to add into git repository.
- package.json - meta info.

<h2>Config</h2>
---
- *default.js* - Default config. It contains common settings and can be stored in the repository.
- *production.js* - Production config. It will override default config if app launch like `$ NODE_ENV=production node ./src/run.js`

Config was developed with node-config module. For more information read [https://github.com/lorenwest/node-config/wiki].

<h3>Structure</h3>
```javascript

module.exports = {
  // Debug mode (print debug information in the stdout)
  debug: true,
  // How often will we restart our fetchers
  restartInterval: '*/60 * * * * *',
  // Setting of the fetchers
  fetchers: {
    // This fetcher implementation is stored in the ./src/fetcher/ directory
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
    // Storage that use redisdb. This storage implementation is stored in the ./src/storages/ directory
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

```

<h2>Decription</h2>
---
The main idea of this app is continuous collection rss|atom articles from differnt feeds into different storages.  
*./src/base/* directory contains base classes for all fetchers and storages.  
These classes must implement all functions marked as `must be implemented in the child` in JSDoc  
Each fetcher can use own storage for storing and adding new articles.
In the *./src/run.js* file storages and fetchers are loaded and then each fetcher is sheduled to run by cron (interval attr in the config)
All fetchers will get only new articles from feed.

<h2>Need to implement in the future</h2>
---
- Save pictures for articles if they exist.
- Parse information about number of likes and reposts news in the social networks.
- Use iconv library for convert encoding of the response.
- Use pm2 process manager for keeping app alive

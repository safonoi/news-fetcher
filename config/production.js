/**
 * Do not store it in the CVS repository
 * It's loaded when you launch the app with NODE_ENV=production
 * NODE_ENV=production node run.js
 * */
module.exports =  {
  debug: false,
  interval: '* */30 * * * *',
  storages: {
    redis: {
      pass: 'here is redisdb pass'
    }
  }
};

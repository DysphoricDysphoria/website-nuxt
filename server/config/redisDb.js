const bluebird = require('bluebird')
const redis = require('redis')
const logger = require('../logger')

class RedisDB {
  constructor() {
    this.redis = bluebird.promisifyAll(redis)
  }

  connectDB() {
    const { REDIS_HOST, REDIS_PORT } = process.env

    const client = this.redis.createClient({
      host: REDIS_HOST,
      port: REDIS_PORT
    })

    if (process.env.NODE_ENV === 'production') {
      client.auth(process.env.REDIS_PASSWORD)
    }

    client.once('error', (err) => {
      logger.error('Redis connect error', err)
      process.exit(1)
    })

    client.on('ready', () => {
      logger.info('Redis connected')
    })

    return client
  }
}

module.exports = new RedisDB().connectDB()

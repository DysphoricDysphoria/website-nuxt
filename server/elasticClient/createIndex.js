const logger = require('../logger')
const client = require('./index')

async function createIndex() {
  try {
    if (await client.indices.exists({ index: 'post' })) {
      await client.indices.delete({ index: 'post' })
    }

    await client.indices.create({
      index: 'post'
    })
    const schema = {
      title: { type: 'text' },
      body: { type: 'text' },
      published: { type: 'byte' },
      postedDate: { type: 'date' },
      id: { type: 'keyword' }
    }
    await client.indices.putMapping({
      index: 'post',
      body: { properties: schema }
    })
    logger.info(
      'index created successfully! Please do a bulkIndex to index all posts again'
    )
  } catch (err) {
    logger.error('Error while creating index!', err)
    return err
  }
}

if (require.main === module) {
  createIndex()
}

module.exports = createIndex

const striptags = require('striptags')

const Post = require('../models/post.model')
const logger = require('../logger')
const client = require('./index')

async function bulkInsertPosts() {
  try {
    const postsCount = await Post.countDocuments()
    const batchSize = 20
    const totalBatches = Math.ceil(postsCount / batchSize)
    const batchArr = Array.apply(null, Array(totalBatches)).map((x, i) => i)
    const posts = []

    for (const batch of batchArr) {
      const skip = batch * batchSize
      const postBatch = await Post.aggregate([
        {
          $match: {}
        },
        {
          $skip: skip
        },
        {
          $limit: batchSize
        },
        {
          $project: {
            id: '$_id',
            title: 1,
            postedDate: 1,
            body: 1,
            published: 1,
            _id: 0
          }
        }
      ])
      for (const post of postBatch) {
        posts.push({
          index: {
            _index: 'post',
            _id: post.id
          }
        })
        let body = post.body
          .replace(/\s/gi, ' ')
          .replace(/<code.*?<\/code>/gi, '')

        body = decodeURI(striptags(body))
        posts.push({ ...post, body })
      }
    }
    const resp = await client.bulk({
      body: posts
    })
    if (resp.error || resp.errors) {
      logger.error('Error while inserting posts', resp)
      return { error: resp.error || resp.errors }
    }

    logger.info('from elastic client, resp is', resp)
    return { postCount: postsCount }
  } catch (err) {
    logger.error('Error while bulk inserting posts:', err)
    return { error: err }
  }
}

module.exports = bulkInsertPosts

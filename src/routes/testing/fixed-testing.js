'use strict' 

const moment = require('moment')

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.post('/fixed-time', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate({ allowGuest: true })
    ],
  }, async (request) => {
      const testingNoTime = await fastify.mongoose.Testing.find({
        $or: [
          { time: null },
          { time: { $exists: false } }
        ]
      })

      await testingNoTime.forEach(async testing => {
        const startTime = moment.unix(testing.startedAt)
        const finishedTime = testing.finishedAt ? moment.unix(testing.finishedAt) : null
        testing.time = finishedTime ? finishedTime.diff(startTime) : moment().diff(startTime)
        await testing.save()
        console.log({ id: testing._id, startTime: startTime.format('DD/MM/YYYY hh:mm:ss'), finishedTime: finishedTime ? finishedTime.format('DD/MM/YYYY hh:mm:ss') : null, time: testing.time })
      })
      return { message: 'Fixed' }
  })

  fastify.get('/fixed-history', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate({ allowGuest: true })
    ],
  }, async (request) => {
      while ((await fastify.mongoose.Testing.countDocuments({ history: { $exists: false } })) > 0) {
        const testings = await fastify.mongoose.Testing.find({ history: { $exists: false } }).limit(50)
        await testings.forEach(async (testing) => {
          testing.history = [{ startDate: testing.startedAt }]
          await testing.save()
        })
      }
      return { message: 'Fixed' }
  })
}
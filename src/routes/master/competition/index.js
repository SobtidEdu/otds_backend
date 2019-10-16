'use strict'

module.exports = async (fastify, options) => {
  if (await fastify.mongoose.ExamConfiguration.countDocuments({ type: 'COMPETITION' }) == 0) {
    let data = await fastify.otimsApi.getCompetitions()
    data = data.map(c => ({ ...c, isActive: true }))
    await fastify.mongoose.ExamConfiguration.create({ type: 'COMPETITION', data: data })
  }

  fastify.register(require('./list'))
  fastify.register(require('./update'))
}
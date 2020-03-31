'use strict' 

const { ROLE } = require('@config/user')
const moment = require('moment')

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.post('/', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN ])
    ]
  }, async (request) => {
    const { body } = request

    const subject = await fastify.mongoose.ExamConfiguration.findOne({ type: 'SUBJECT' })

    const { data } = subject

    if (data.find(s => s.name == body.name)) {
      throw fastify.httpErrors.badRequest('ชื่อวิชาซ้ำ')
    } else {
      data.push({ id: moment().unix(), name: body.name, isActive: false })
    }

    return await fastify.mongoose.ExamConfiguration.update({ type: 'SUBJECT' }, { data })
  })
    
}

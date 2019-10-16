'use strict' 

const { ROLE } = require('@config/user')

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.get('/', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate({ allowGuest: true })
    ]
  }, async (request) => {
    const { user } = request
    const response = await fastify.mongoose.ExamConfiguration.findOne({ type: 'COMPETITION' }).lean()
    
    let { data } = response 
    
    if (!user || !user.role === ROLE.ADMIN) {
      data = data.filter(competition => competition.isActive)
    }
    
    return data
  })
    
}

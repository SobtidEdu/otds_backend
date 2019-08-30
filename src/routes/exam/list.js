'use strict' 

module.exports = async (fastify, opts) => {
  fastify.get('/', {
    preValidation: [
      fastify.authenticate()
    ]
  }, async (request) => {
    const { user, query } = request

    const baseAggregate = [
      {
        $project: { 
          _id: 1,
          name: 1,
          subject: 1,
          code: 1,
          type: 1,
          status: 1,
          createdAt: 1,
        }
      }, {
        $match: {
          owner: user._id
        }
      }
    ]

    return await fastify.paginate(fastify.mongoose.ExamSet, query, baseAggregate)
  })
}

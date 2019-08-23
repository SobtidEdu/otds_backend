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
          imageProfile: 1,
          subject: 1,
          code: 1,
          type: 1,
          isActive: 1,
          createdAt: 1,
        }
      }
    ]

    return await fastify.paginate(fastify.mongoose.ExamSet, query, baseAggregate)

    return {
      page: 1,
      lastPage: 1,
      totalCount: 0,
      items: [
        {
          _id: 'aaaa',
          name: "คณิตศาสตร์ ป.4",
          subject: "คณิตศาสตร์",
          code: "MF00000001",
          type: "G",
          createdAt: 1563879343,
          status: true
        },
        {
          name: "วิทยาศาสตร์ ป.4",
          subject: "วิทยาศาสตร์",
          code: "MF00000001",
          type: "G",
          createdAt: 1563879343,
          status: true
        },
        {
          name: "คณิตศาสตร์ ป.4",
          subject: "คณิตศาสตร์",
          code: "MF00000001",
          type: "G",
          createdAt: 1563879343,
          status: true
        },
        {
          name: "วิทยาศาสตร์ ป.4",
          subject: "วิทยาศาสตร์",
          code: "MF00000001",
          type: "G",
          createdAt: 1563879343,
          status: true
        }
      ]
    }
  })
}

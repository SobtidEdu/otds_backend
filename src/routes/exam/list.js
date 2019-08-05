'use strict' 

module.exports = async (fastify, opts) => {
  fastify.get('/', {
    preValidation: [
      fastify.authenticate()
    ]
  }, async (request) => {
    return {
      page: 1,
      lastPage: 1,
      totalCount: 0,
      items: [
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

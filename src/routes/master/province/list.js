'use strict'

const { ROLE } = require('@config/user.config')

module.exports = async (fastify, options) => {
  const schema = {
    query: {
      validation: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            minimum: 1
          },
          limit: { 
            type: 'integer',
            enum: [10, 25, 50, 100]
          },
          sort: {
            type: 'object',
            properties: {
              name: { type: 'string', enum: ['asc', 'desc'] },
              isActived: { type: 'string', enum: ['asc', 'desc'] },
              createdAt: { type: 'string', enum: ['asc', 'desc'] },
              updatedAt: { type: 'string', enum: ['asc', 'desc'] }
            }
          },
          filters: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              isActived: { type: 'boolean' }
            }
          }
        }
      },
      message: {
        page: {
          type: fastify.message('errors.pagination.page.type')
        },
        limit: {
          type: fastify.message('errors.pagination.limit.type'),
          enum: fastify.message('errors.pagination.limit.enum')
        }
      }
    }
  }

  fastify.get('/', 
  { 
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate({ allowGuest: true })
    ]
  }, async (request) => {
    const { query } = request

    if (!request.user || request.user.role !== ROLE.ADMIN) {
      query.filters = Object.assign(query.filters || {}, {isActive: true})
    }
    
    return fastify.paginate(fastify.mongoose.Province, query)
  })
}
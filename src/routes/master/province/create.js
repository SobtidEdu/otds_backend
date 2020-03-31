'use strict'
const { ROLE } = require('@config/user')
module.exports = async (fastify, options) => {
  const schema = {
    body: {
      validation: {
        $async: true,
        type: 'object',
        properties: {
          name: { 
            type: 'string',
            isExist: { prop: 'name', collection: 'provinces' }
          }
        },
        required: ['name'],
      },
      message: {
        name: {
          isExist: 'มีจังหวัดนี้อยู่ในระบบแล้ว',
          required: 'กรุณากรอกชื่อจังหวัด'
        },
      }
    }
  }

  fastify.post('/', 
  { 
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN])
    ]
  },
  async (request) => {
    await fastify.mongoose.Province.create(request.body)
    return { message: 'Province has been created' }
  })
}
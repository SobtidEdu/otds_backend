'use strict'

const { ROLE } = require('@config/user')

module.exports = async (fastify, options) => {
  fastify.delete('/:prefixId', 
  { 
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN])
    ]
  }, async (request) => {
    const { params, body } = request
    
    const prefix = await fastify.mongoose.Prefix.findOne({}).lean()
    const { data } = prefix

    let indexPrefix = data.findIndex(p => p._id.toString() === params.prefixId)

    if (indexPrefix == -1) throw fastify.httpErrors.badRequest('Invalid prefix id')
    data.splice(indexPrefix, 1)

    await fastify.mongoose.Prefix.updateOne({ _id: prefix._id }, { data })
    return { message: 'ลบข้อมูลคำนำหน้าสำเร็จ' }
  })
}
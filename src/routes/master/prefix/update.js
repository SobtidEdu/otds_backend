'use strict'

const { ROLE } = require('@config/user')

module.exports = async (fastify, options) => {
  fastify.patch('/:prefixId', 
  { 
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN])
    ]
  }, async (request) => {
    const { params, body } = request
    
    const prefix = await fastify.mongoose.Prefix.findOne({}).lean()
    const { data } = prefix

    const indexPrefix = data.findIndex(p => p._id.toString() === params.prefixId)
    if (indexPrefix > -1) {
      const prefixUpdate = {
        name: body.name || data[indexPrefix].name,
        visible: {
          teacher: body.visible && body.visible.teacher !== undefined ? body.visible.teacher : data[indexPrefix].visible.teacher,
          student: body.visible && body.visible.student !== undefined ? body.visible.student : data[indexPrefix].visible.student
        }
      }
      data[indexPrefix] = prefixUpdate
    }

    await fastify.mongoose.Prefix.updateOne({ _id: prefix._id }, { data })
    return { message: 'แก้ไขข้อมูลคำนำหน้าสำเร็จ' }
  })

  fastify.patch('/:prefixId/seq', 
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

    const movePrefix = data[indexPrefix]

    data.splice(indexPrefix, 1)
    
    data.splice(body.seq, 0, movePrefix)
    

    await fastify.mongoose.Prefix.updateOne({ _id: prefix._id }, { data })
    return { message: 'แก้ไขลำดับข้อมูลคำนำหน้าสำเร็จ' }
  })
}
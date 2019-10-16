'use strict' 

const { ROLE } = require('@config/user')

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.patch('/:subjectId', {
    preValidatin: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN ])
    ]
  }, async (request) => {
    const { params, body } = request
    
    const subject = await fastify.mongoose.ExamConfiguration.findOne({ type: 'SUBJECT' }).lean()

    const { data } = subject

    const index = data.findIndex(s => s.id === params.subjectId)
    if (index > -1) {
      
      data[index].isActive = body.isActive || data[index].isActive
    }

    await fastify.mongoose.ExamConfiguration.updateOne({ _id: subject._id }, { data })
    return { message: 'แก้ไขข้อมูลวิชาสำเร็จ' }
  })

  fastify.patch('/:subjectId/seq', 
  { 
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN])
    ]
  }, async (request) => {
    const { params, body } = request
    
    const subject = await fastify.mongoose.ExamConfiguration.findOne({ type: 'SUBJECT' }).lean()
    const { data } = subject

    let index = data.findIndex(s => s.id === params.subjectId)

    if (index == -1) throw fastify.httpErrors.badRequest('Invalid subject id')

    const moveSubject = data[index]

    data.splice(index, 1)

    data.splice(body.seq, 0, moveSubject)

    await fastify.mongoose.ExamConfiguration.updateOne({ _id: subject._id }, { data })
    return { message: 'แก้ไขลำดับข้อมูลวิชาสำเร็จ' }
  })
    
}

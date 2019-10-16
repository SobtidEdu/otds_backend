'use strict' 

const { ROLE } = require('@config/user')

module.exports = async (fastify, opts) => { 
  const schema = {}

  fastify.patch('/:competitionId', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN ])
    ]
  }, async (request) => {
    const { params, body } = request
    
    const competition = await fastify.mongoose.ExamConfiguration.findOne({ type: 'COMPETITION' }).lean()

    const { data } = competition

    const index = data.findIndex(c => c.id == params.competitionId)

    if (index > -1) {
      data[index].isActive = body.isActive !== undefined ? body.isActive : data[index].isActive
    }

    await fastify.mongoose.ExamConfiguration.updateOne({ _id: competition._id }, { data })

    return { message: 'แก้ไขข้อมูลรายการแข่งขันสำเร็จ' }
  })

  fastify.patch('/:competitionId/seq', 
  { 
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN])
    ]
  }, async (request) => {
    const { params, body } = request
    
    const competition = await fastify.mongoose.ExamConfiguration.findOne({ type: 'COMPETITION' }).lean()
    const { data } = competition

    let index = data.findIndex(s => s.id == params.competitionId)

    if (index == -1) throw fastify.httpErrors.badRequest('Invalid competition id')

    const moveCompetition = data[index]

    data.splice(index, 1)

    data.splice(body.seq, 0, moveCompetition)

    await fastify.mongoose.ExamConfiguration.updateOne({ _id: competition._id }, { data })
    return { message: 'แก้ไขลำดับข้อมูลรายการแข่งขันสำเร็จ' }
  })
    
}

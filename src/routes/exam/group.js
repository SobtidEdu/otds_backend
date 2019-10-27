'use strict' 

const { ROLE } = require('@config/user')
const mongoose = require('mongoose')

module.exports = async (fastify, opts) => {
  fastify.get('/:examId/!group', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN, ROLE.TEACHER, ROLE.SUPER_TEACHER])
    ]
  }, async (request) => {
    const { user, params, query } = request
    
    const baseAggregate = [
      {
        $match: {
          $and: [
            { owner: mongoose.Types.ObjectId(user._id) },
            { 
              exams: {
                $elemMatch: {
                  $ne: {
                    _id: mongoose.Types.ObjectId(params.examId)
                  }
                }
              }
            }
          ]
        }
      }
    ]
    
    if (!query.limit) {
      query.limit = 100
    }

    const response = await fastify.paginate(fastify.mongoose.Group, query, baseAggregate)
    return response
  })

  fastify.put('/:examId/group', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN])
    ]
  }, async (request) => {
    const { params, body } = request;
    
    let { groupIds } = body
    await fastify.mongoose.Group.updateMany({ _id: { $in: groupIds } }, { exams: { $push: { _id: params.examId } } })

    return { message: 'เพิ่มข้อสอบเข้ากลุ่มสำเร็จ' }
  })
}
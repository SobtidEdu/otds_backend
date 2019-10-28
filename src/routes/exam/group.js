'use strict' 

const { ROLE } = require('@config/user')
const mongoose = require('mongoose')
const moment = require('moment')

module.exports = async (fastify, opts) => {
  fastify.get('/:examId/!group', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN, ROLE.TEACHER, ROLE.SUPER_TEACHER])
    ]
  }, async (request) => {
    const { user, params, query } = request

    let baseAggregate = [
      {
        $match: {
          $and: [
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

    if (user.role !== ROLE.ADMIN) {
      baseAggregate[0]['$match']['$and'].push({ owner: mongoose.Types.ObjectId(user._id) })
    }
    
    if (!query.limit) {
      query.limit = 100
    }

    const response = await fastify.paginate(fastify.mongoose.Group, query, baseAggregate)
    return response
  })

  fastify.put('/:examId/group', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN])
    ]
  }, async (request) => {
    const { params, body } = request;
    
    let { groupIds } = body
    await fastify.mongoose.Group.updateMany({ _id: { $in: groupIds } }, { $push: { exams: { _id: params.examId, status: true, addedAt: moment().unix() } } })

    return { message: 'เพิ่มข้อสอบเข้ากลุ่มสำเร็จ' }
  })
}
'use strict' 
const mongoose = require('mongoose')
const { ROLE } = require('@config/user')

module.exports = async (fastify, opts) => {
  fastify.get('/', {
    preValidation: [
      fastify.authenticate()
    ]
  }, async (request) => {
    const { user, query } = request
    let baseAggregate = []
    
    if (user.role == ROLE.STUDENT) {
      baseAggregate = [
        {
          $project: { 
            _id: 1,
            name: 1,
            subject: 1,
            code: 1,
            type: 1,
            status: 1,
            createdAt: 1,
          }
        }, {
          $match: {
            owner: mongoose.Schema.ObjectId(user._id)
          }
        }
      ]
    } else {
      baseAggregate = [
        {
          $project: { 
            _id: 1,
            name: 1,
            subject: 1,
            code: 1,
            type: 1,
            status: 1,
            createdAt: 1,
          }
        }, {
          $match: {
            owner: mongoose.Schema.ObjectId(user._id)
          }
        }
      ]
    }

    return await fastify.paginate(fastify.mongoose.Exam, query, baseAggregate)
  })
}

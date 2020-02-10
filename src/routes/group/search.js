'use strict'

const { ROLE } = require('@config/user')
const { STUDENT_STATUS } = require('@config/group')
const mongoose = require('mongoose')

module.exports = async (fastify, options) => {

  const schema = {}

  fastify.get('/search', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ROLE.STUDENT])
    ]
  }, async (request) => {

    const { user, query } = request;

    if (!query.q) return []

    let baseAggregateOptions = [
      {
        $match: {
          $and: [
            { code: new RegExp(query.q.toUpperCase()) },
            { deletedAt: null }
          ]
        }
      },
      { 
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner'
        }
      },
      { $unwind: "$owner" },
      {
        $project: {
          _id: 1,
          name: 1,
          code: 1,
          logo: 1,
          students: 1,
          ownerName: { $concat: [ "$owner.firstName", " ", "$owner.lastName"] }, 
          createdAt: 1
        }
      }
    ]

    const searchedGroup = await fastify.paginate(fastify.mongoose.Group, query, baseAggregateOptions)

    searchedGroup.items = searchedGroup.items
    .map(group => {
      group.logo = fastify.storage.getUrlGroupLogo(group.logo)
      const student = group.students.find(student => student.userInfo.toString() === user._id.toString())
      delete group.students
      group.status = student ? student.status : 'none'
      return group
    })

    return searchedGroup
  })
}
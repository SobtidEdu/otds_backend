'use strict' 

const { Types } = require('mongoose')
const { ROLE, GROUP_STATUS } = require('@config/user')

module.exports = async function(fastify, opts, next) { 
    const schema = {}

    fastify.get('/:groupId/students/request', {
      preValidation: [
        (request) => fastify.validate(schema, request),
        fastify.authenticate(),
        fastify.authorize([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN])
      ]
    }, async (request) => {
  
      const { query, params } = request;

      const baseAggregateOptions = [
        { $match: { _id: Types.ObjectId(params.groupId) } },
        { $unwind: '$students.requestToJoin'},
        {
          $lookup: {
            from: 'users',
            localField: 'students.requestToJoin.userInfo',
            foreignField: '_id',
            as: 'requestor'
          }
        },
        {
          $project: {
            'requestor.profileImage': 1,
            'requestor._id': 1,
            'requestor.firstName': 1,
            'requestor.lastName': 1,
            'requestor.school': 1,
            'students.requestToJoin.requestedDate': 1
          }
        }
      ]
      const results = await fastify.paginate(fastify.mongoose.Group, query, baseAggregateOptions)

      results.items = results.items.map(item => ({
          profileImage: fastify.storage.getUrlProfileImage(item.requestor[0].profileImage),
          requestorId: item.requestor[0]._id,
          requestorName: `${item.requestor[0].firstName} ${item.requestor[0].lastName}`,
          schoolName: item.requestor[0].school.name.text,
          requestedDate: item.students.requestToJoin.requestedDate
      }))

      return results
    })
}

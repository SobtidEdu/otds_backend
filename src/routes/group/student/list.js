'use strict' 

const { Types } = require('mongoose')
const { ROLE, GROUP_STATUS } = require('@config/user')

module.exports = async function(fastify, opts, next) { 
    const schema = {}

    fastify.get('/:groupId/students', {
      preValidation: [
        (request) => fastify.validate(schema, request),
        fastify.authenticate(),
        fastify.authorize([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN])
      ]
    }, async (request) => {
      const { query, params } = request;

      const baseAggregateOptions = [
        { $match: { _id: Types.ObjectId(params.groupId) } },
        { $unwind: '$students' },
        {
          $lookup: {
            from: 'users',
            localField: 'students.userInfo',
            foreignField: '_id',
            as: 'studentInfo'
          }
        },
        { $unwind: '$studentInfo' },
        {
          $project: {
            'studentInfo.profileImage': 1,
            'studentInfo._id': 1,
            'studentInfo.firstName': 1,
            'studentInfo.lastName': 1,
            'studentInfo.school': 1,
            'students': 1
          }
        }
      ]

      const results = await fastify.paginate(fastify.mongoose.Group, query, baseAggregateOptions)
      // return results
      results.items = results.items.map(item => ({
        profileImage: fastify.storage.getUrlProfileImage(item.studentInfo.profileImage),
        studentId: item.studentInfo._id,
        studentName: `${item.studentInfo.firstName} ${item.studentInfo.lastName}`,
        schoolName: item.studentInfo.school.name.text,
        status: item.students.status,
        requestedDate: item.students.requestedDate,
        jointDate: item.students.jointDate,
        leftDate: item.students.leftDate
      }))

      return results
    })
}

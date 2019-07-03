'use strict' 

const { Types } = require('mongoose')
const { ROLE, GROUP_STAUS } = require('@config/user')

module.exports = async function(fastify, opts, next) { 
    const schema = {}

    fastify.get('/:groupId/students/join', {
      preValidation: [
        (request) => fastify.validate(schema, request),
        fastify.authenticate(),
        fastify.authorize([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN])
      ]
    }, async (request) => {
  
      const { query, params } = request;

      const baseAggregateOptions = [
        { $match: { _id: Types.ObjectId(params.groupId) } },
        { $unwind: '$students.inGroup'},
        {
          $lookup: {
            from: 'users',
            localField: 'students.inGroup.userInfo',
            foreignField: '_id',
            as: 'student'
          }
        },
        {
          $project: {
            'student.profileImage': 1,
            'student._id': 1,
            'student.firstName': 1,
            'student.lastName': 1,
            'student.school': 1,
            'students.inGroup.jointDate': 1
          }
        }
      ]
      const results = await fastify.paginate(fastify.mongoose.Group, query, baseAggregateOptions)

      results.items = results.items.map(item => ({
          profileImage: item.student[0].profileImage,
          studentId: item.student[0]._id,
          studentName: `${item.student[0].firstName} ${item.student[0].lastName}`,
          schoolName: item.student[0].school.name.text,
          jointDate: item.students.inGroup.jointDate
      }))

      return results
    })
}

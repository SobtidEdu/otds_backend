'use strict'

const { ROLE } = require('@config/user')
const { STUDENT_STATUS } = require('@config/group')

module.exports = async (fastify, options) => {

  fastify.get('/student-left', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN ])
    ]
  }, async (request, reply) => {
    
    const { user, query } = request;

    const baseOptions = [
      { 
        $match: {
          $and: [
            { owner: user._id },
            {
              students: {
                $elemMatch: {
                  status: STUDENT_STATUS.LEFT,
                  teacherSeenLeft: false
                }
              }
            }
          ]
        }
      },
      {
        $unwind: '$students'
      },
      {
        $match: {
          'students.status': STUDENT_STATUS.LEFT,
          'students.teacherSeenLeft': false
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'students.userInfo',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          name: 1,
          code: 1,
          user: {
            _id: 1,
            profileImage: 1,
            prefixName: 1,
            firstName: 1,
            lastName: 1,
            school: {
              name: 1
            }
          },
          students: {
            leftDate: 1,
            teacherSeenLeft: 1
          }
        }
      }
    ]

    const response = await fastify.mongoose.Group.aggregate(baseOptions)
    return response
    .map(student => ({
      _id: student.user._id,
      profileImage: fastify.storage.getUrlProfileImage(student.user.profileImage),
      prefixName: student.user.prefixName,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      groupName: student.name,
      groupCode: student.code,
      schoolName: student.user.school.name.text,
      leftDate: student.students.leftDate,
      teacherSeenLeft: student.students.teacherSeenLeft
    }))
  })

  fastify.patch('/student-left/seen', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN ])
    ]
  }, async (request, reply) => {
    
    const { user } = request

    const response = await fastify.mongoose.Group.updateMany({
      owner: user._id,
      students: {
        $elemMatch: { 
          status: STUDENT_STATUS.LEFT,
          teacherSeenLeft: false
        }
      }
    }, {
      $set: {
        'students.$.teacherSeenLeft': true
      }
    })
    return response
  })
}
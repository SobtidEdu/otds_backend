'use strict'

const { ROLE } = require('@config/user')

module.exports = async (fastify, options) => {
  fastify.get('/login', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN])
    ]
  }, async (request, reply) => {
    const { query } = request

    if (!query.year) {
      query.year = new Date().getFullYear()
    }

    const aggregate = [
      {
        $match: {
          year: query.year
        }
      },
      {
        $project: {
          month: 1,
          year: 1,
          student: { 
            $size: {
              $filter: {
                input: "$users",
                cond: { $eq: ["$$this.role", ROLE.STUDENT]}
              }
            }
          },
          teacher: { 
            $size: {
              $filter: {
                input: "$users",
                cond: { $eq: ["$$this.role", ROLE.TEACHER]}
              }
            }
          },
          superTeacher: { 
            $size: {
              $filter: {
                input: "$users",
                cond: { $eq: ["$$this.role", ROLE.SUPER_TEACHER]}
              }
            }
          },
          admin: { 
            $size: {
              $filter: {
                input: "$users",
                cond: { $eq: ["$$this.role", ROLE.ADMIN]}
              }
            }
          }
        }
      },
      {
        $group: {
          _id: {
            month: "$month",
            year: "$year"
          },
          student: { $sum: "$student"},
          teacher: { $sum: "$teacher"},
          superTeacher: { $sum: "$superTeacher"},
          admin: { $sum: "$admin"},
        }
      }
    ] 

    const response = await fastify.mongoose.LoginStat.aggregate(aggregate)
    return response.map(stats => ({
      month: stats._id.month,
      year: stats._id.year,
      student: stats.student,
      teacher: stats.teacher,
      superTeacher: stats.superTeacher,
      admin: stats.admin,
    }))
  })
}
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
          year: parseInt(query.year)
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
      total: [stats.student, stats.teacher, stats.superTeacher, stats.admin].reduce((total, num) => total + num)
    }))
  })

  fastify.get('/login/detail/:year/:month', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN])
    ]
  }, async (request, reply) => {
    const { params } = request

    const aggregate = [
      {
        $match: {
          year: parseInt(params.year),
          month: parseInt(params.month)
        }
      },
      {
        $unwind: "$users"
      },
      {
        $lookup: {
          from: 'users',
          localField: 'users._id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: "$user"
      },
      {
        $lookup: {
          from: 'provinces',
          localField: 'user.school.province.id',
          foreignField: '_id',
          as: 'province'
        }
      },
      {
        $unwind: "$province"
      },
      {
        $group: {
          _id: {
            province: "$province.name",
            region: "$province.region",
          },
          count: { $sum: 1 }
        }
      }
    ] 

    const response = await fastify.mongoose.LoginStat.aggregate(aggregate)
    return response
    .map(response => ({
      province: response._id.province,
      region: response._id.region,
      count: response.count,
    }))
  })
}
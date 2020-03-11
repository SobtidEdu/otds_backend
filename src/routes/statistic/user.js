'use strict'

const { ROLE } = require('@config/user')
const moment = require('moment')

module.exports = async (fastify, options) => {
  fastify.get('/user', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN])
    ]
  }, async (request, reply) => {
    const { query } = request

    if (!query.year) {
      query.year = new Date().getFullYear()
    }

    const start = moment(`${query.year}0101000000 `, "YYYYMMDDHHmmss").unix()
    const end = moment(`${query.year}1231235959 `, "YYYYMMDDHHmmss").unix()

    const aggregate = [
      {
        $match: {
          createdAt: {
            $gte: start,
            $lt: end
          }
        }
      },
      {
        $project: {
          month: {
            $dateToString: {
              format: '%m',
              date: {
                $toDate: {
                  $multiply: [1000, "$createdAt"]
                }
              }
            }
          },
          year: {
            $dateToString: {
              format: '%Y',
              date: {
                $toDate: {
                  $multiply: [1000, "$createdAt"]
                }
              }
            }
          },
          student: {
            $cond: [{ $eq: ["$role", ROLE.STUDENT] }, 1, 0]
          },
          teacher: {
            $cond: [{ $eq: ["$role", ROLE.TEACHER] }, 1, 0]
          },
          superTeacher: {
            $cond: [{ $eq: ["$role", ROLE.SUPER_TEACHER] }, 1, 0]
          },
          admin: {
            $cond: [{ $eq: ["$role", ROLE.ADMIN] }, 1, 0]
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
          admin: { $sum: "$admin"}
        }
      }
    ] 

    const response = await fastify.mongoose.User.aggregate(aggregate)
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

  fastify.get('/user/detail/:year/:month', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN])
    ]
  }, async (request, reply) => {
    const { params } = request

    const start = moment().year(params.year).month(params.month).startOf('month').unix()
    const end = moment().year(params.year).month(params.month).endOf('month').unix()

    const aggregate = [
      {
        $match: {
          createdAt: {
            $gte: start,
            $lt: end
          }
        }
      },
      {
        $lookup: {
          from: 'provinces',
          localField: 'school.province.id',
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

    const response = await fastify.mongoose.User.aggregate(aggregate)
    return response
    .map(response => ({
      province: response._id.province,
      region: response._id.region,
      count: response.count,
    }))
  })

  fastify.get('/user/transactions/:year/:month', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN])
    ]
  }, async (request, reply) => {
    const { params } = request

    const start = moment().year(params.year).month(params.month).startOf('month').unix()
    const end = moment().year(params.year).month(params.month).endOf('month').unix()

    const aggregate = [
      {
        $match: {
          createdAt: {
            $gte: start,
            $lt: end
          }
        }
      },
      {
        $lookup: {
          from: 'provinces',
          localField: 'school.province.id',
          foreignField: '_id',
          as: 'province'
        }
      },
      {
        $unwind: "$province"
      }
    ] 

    const response = await fastify.mongoose.User.aggregate(aggregate)
    return response
    .map((item, index) => ({
      order: index+1,
      username: item.username ? item.username : '',
      email: item.email,
      firstName: item.firstName,
      lastName: item.lastName,
      schoolName: item.school.name.text,
      provinceName: item.province.name,
      role: item.role,
      registeredDate: moment.unix(item.createdAt).add(543, 'y').format('DD/MM/YYYY'),
      registeredTime: moment.unix(item.createdAt).format('HH:mm:ss'),
    }))
  })
}
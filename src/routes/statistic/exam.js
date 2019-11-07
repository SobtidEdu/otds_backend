'use strict'

const { ROLE } = require('@config/user')
const moment = require('moment')

module.exports = async (fastify, options) => {
  fastify.get('/exam', {
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
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
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
              format: '%m',
              date: {
                $toDate: {
                  $multiply: [1000, "$createdAt"]
                }
              }
            }
          },
          student: {
            $cond: [{ $eq: ["$user.role", ROLE.STUDENT] }, 1, 0]
          },
          teacher: {
            $cond: [{ $eq: ["$user.role", ROLE.TEACHER] }, 1, 0]
          },
          superTeacher: {
            $cond: [{ $eq: ["$user.role", ROLE.SUPER_TEACHER] }, 1, 0]
          },
          admin: {
            $cond: [{ $eq: ["$user.role", ROLE.ADMIN] }, 1, 0]
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

    const response = await fastify.mongoose.Exam.aggregate(aggregate)
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

  fastify.get('/exam/detail/:year/:month/:type', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN])
    ]
  }, async (request, reply) => {
    const { params } = request

    const start = moment(`${params.year}${params.month}01000000 `, "YYYYMMDDHHmmss").unix()
    const end = moment(`${params.year}${params.month}30235959 `, "YYYYMMDDHHmmss").unix()

    if (params.type == 'examType') {
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
          $group: {
            _id: {
              type: "$type",
            },
            count: { $sum: 1 }
          }
        }
      ] 
  
      const response = await fastify.mongoose.Exam.aggregate(aggregate)
      return response.map((stat) => ({
        type: stat._id.type,
        total: stat.count
      }))
    }

    if (params.type == 'grade') {
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
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: "$user"
        },
        {
          $project: {
            grade: 1,
            student: {
              $cond: [{ $eq: ["$user.role", ROLE.STUDENT] }, 1, 0]
            },
            teacher: {
              $cond: [{ $eq: ["$user.role", ROLE.TEACHER] }, 1, 0]
            },
            superTeacher: {
              $cond: [{ $eq: ["$user.role", ROLE.SUPER_TEACHER] }, 1, 0]
            },
            admin: {
              $cond: [{ $eq: ["$user.role", ROLE.ADMIN] }, 1, 0]
            }
          }
        },
        {
          $group: {
            _id: {
              grade: "$grade",
            },
            student: { $sum: "$student"},
            teacher: { $sum: "$teacher"},
            superTeacher: { $sum: "$superTeacher"},
            admin: { $sum: "$admin"},
          }
        }
      ]

      const response = await fastify.mongoose.Exam.aggregate(aggregate)
      return response.map((stat) => ({
        grade: stat._id.grade,
        student: stat.student,
        teacher: stat.teacher,
        superTeacher: stat.superTeacher,
        admin: stat.admin
      }))
    }
    
    if (params.type == 'criterion') {
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
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: "$user"
        },
        {
          $project: {
            criterion: 1,
            student: {
              $cond: [{ $eq: ["$user.role", ROLE.STUDENT] }, 1, 0]
            },
            teacher: {
              $cond: [{ $eq: ["$user.role", ROLE.TEACHER] }, 1, 0]
            },
            superTeacher: {
              $cond: [{ $eq: ["$user.role", ROLE.SUPER_TEACHER] }, 1, 0]
            },
            admin: {
              $cond: [{ $eq: ["$user.role", ROLE.ADMIN] }, 1, 0]
            }
          }
        },
        {
          $group: {
            _id: {
              criterion: "$criterion",
            },
            student: { $sum: "$student"},
            teacher: { $sum: "$teacher"},
            superTeacher: { $sum: "$superTeacher"},
            admin: { $sum: "$admin"},
          }
        }
      ]

      const response = await fastify.mongoose.Exam.aggregate(aggregate)
      return response.map((stat) => ({
        criterion: stat._id.criterion,
        student: stat.student,
        teacher: stat.teacher,
        superTeacher: stat.superTeacher,
        admin: stat.admin
      }))
    }

    if (params.type == 'subject') {
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
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: "$user"
        },
        {
          $project: {
            subject: 1,
            student: {
              $cond: [{ $eq: ["$user.role", ROLE.STUDENT] }, 1, 0]
            },
            teacher: {
              $cond: [{ $eq: ["$user.role", ROLE.TEACHER] }, 1, 0]
            },
            superTeacher: {
              $cond: [{ $eq: ["$user.role", ROLE.SUPER_TEACHER] }, 1, 0]
            },
            admin: {
              $cond: [{ $eq: ["$user.role", ROLE.ADMIN] }, 1, 0]
            }
          }
        },
        {
          $group: {
            _id: {
              subject: "$subject",
            },
            student: { $sum: "$student"},
            teacher: { $sum: "$teacher"},
            superTeacher: { $sum: "$superTeacher"},
            admin: { $sum: "$admin"},
          }
        }
      ]

      const response = await fastify.mongoose.Exam.aggregate(aggregate)
      return response.map((stat) => ({
        subject: stat._id.subject,
        student: stat.student,
        teacher: stat.teacher,
        superTeacher: stat.superTeacher,
        admin: stat.admin
      }))
    }
  })
}
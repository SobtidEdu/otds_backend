'use strict'

const { ROLE } = require('@config/user')
const moment = require('moment')

module.exports = async (fastify, options) => {
  fastify.get('/finished', {
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
          finishedAt: {
            $gte: start,
            $lt: end
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
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
                  $multiply: [1000, "$finishedAt"]
                }
              }
            }
          },
          year: {
            $dateToString: {
              format: '%Y',
              date: {
                $toDate: {
                  $multiply: [1000, "$finishedAt"]
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

    const response = await fastify.mongoose.Testing.aggregate(aggregate)
    return response
    .map(stats => ({
      month: parseInt(stats._id.month),
      year: stats._id.year,
      student: stats.student,
      teacher: stats.teacher,
      superTeacher: stats.superTeacher,
      admin: stats.admin,
      total: [stats.student, stats.teacher, stats.superTeacher, stats.admin].reduce((total, num) => total + num)
    }))
  })

  fastify.get('/finished/detail/:year/:month/:type', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN])
    ]
  }, async (request, reply) => {
    const { params } = request

    const start = moment().year(params.year).month(parseInt(params.month)-1).startOf('month').unix()
    const end = moment().year(params.year).month(parseInt(params.month)-1).endOf('month').unix()

    if (params.type == 'type') {
      const aggregate = [
        {
          $match: {
            finishedAt: {
              $gte: start,
              $lt: end
            }
          }
        },
        {
          $lookup: {
            from: 'exams',
            localField: 'examId',
            foreignField: '_id',
            as: 'exam'
          }
        },
        {
          $unwind: '$exam'
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: "$user"
        },
        {
          $project: {
            exam: {
              grade: 1,
              type: 1,
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
              type: "$exam.type",
            },
            student: { $sum: "$student"},
            teacher: { $sum: "$teacher"},
            superTeacher: { $sum: "$superTeacher"},
            admin: { $sum: "$admin"},
          }
        }
      ] 
  
      const response = await fastify.mongoose.Testing.aggregate(aggregate)
      return response.map((stat) => ({
        type: stat._id.type,
        student: stat.student,
        teacher: stat.teacher,
        superTeacher: stat.superTeacher,
        admin: stat.admin,
        total: stat.student + stat.teacher + stat.superTeacher + stat.admin
      }))
    }

    if (params.type == 'grade') {
      const aggregate = [
        {
          $match: {
            finishedAt: {
              $gte: start,
              $lt: end
            }
          }
        },
        {
          $lookup: {
            from: 'exams',
            localField: 'examId',
            foreignField: '_id',
            as: 'exam'
          }
        },
        {
          $unwind: '$exam'
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: "$user"
        },
        {
          $project: {
            exam: {
              grade: 1,
              type: 1,
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
              grade: "$exam.grade",
              type: "$exam.type",
            },
            student: { $sum: "$student"},
            teacher: { $sum: "$teacher"},
            superTeacher: { $sum: "$superTeacher"},
            admin: { $sum: "$admin"},
          }
        }
      ]

      const response = await fastify.mongoose.Testing.aggregate(aggregate)
      return response
      .map((stat) => ({
        grade: stat._id.grade,
        type: stat._id.type,
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
            finishedAt: {
              $gte: start,
              $lt: end
            }
          }
        },
        {
          $lookup: {
            from: 'exams',
            localField: 'examId',
            foreignField: '_id',
            as: 'exam'
          }
        },
        {
          $unwind: '$exam'
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: "$user"
        },
        {
          $project: {
            exam: {
              subject: 1,
              type: 1
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
              subject: "$exam.subject",
              type: "$exam.type"
            },
            student: { $sum: "$student"},
            teacher: { $sum: "$teacher"},
            superTeacher: { $sum: "$superTeacher"},
            admin: { $sum: "$admin"},
          }
        }
      ]

      const response = await fastify.mongoose.Testing.aggregate(aggregate)
      return response.map((stat) => ({
        subject: stat._id.subject,
        type: stat._id.type,
        student: stat.student,
        teacher: stat.teacher,
        superTeacher: stat.superTeacher,
        admin: stat.admin
      }))
    }
  })

  fastify.get('/finished/transactions/:year/:month', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ROLE.ADMIN])
    ]
  }, async (request, reply) => {
    const { params } = request

    const start = moment().year(params.year).month(parseInt(params.month)-1).startOf('month').unix()
    const end = moment().year(params.year).month(parseInt(params.month)-1).endOf('month').unix()

    const aggregate = [
      {
        $match: {
          finishedAt: {
            $gte: start,
            $lt: end
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: "$user"
      },
      {
        $lookup: {
          from: 'exams',
          localField: 'examId',
          foreignField: '_id',
          as: 'exam'
        }
      },
      {
        $unwind: "$exam"
      }
    ]

    const response = await fastify.mongoose.Testing.aggregate(aggregate)
    return response
    .map((item, index) => ({
      order: index+1,
      username: item.user.username,
      email: item.user.email,
      firstName: item.user.firstName,
      lastName: item.user.lastName,
      schoolName: item.user.school.name.text,
      role: item.user.role,
      code: item.exam.code,
      name: item.exam.name,
      type: item.exam.type,
      criterion: item.exam.criterion,
      competitionYears: item.exam.type == 'C' ? item.exam.competition.years.join(',') : '-',
      subject: item.exam.subject,
      grade: item.exam.grade,
      quantity: item.exam.quantity,
      date: moment.unix(item.startedAt).add(543, 'y').format('DD/MM/YYYY'),
      time: moment.unix(item.startedAt).format('HH:mm:ss')
    }))
  })
}
'use strict' 

const { ROLE } = require('@config/user')

module.exports = async (fastify, opts) => {
  fastify.get('/', {
    preValidation: [
      fastify.authenticate({ allowGuest: true })
    ]
  }, async (request) => {
    const { user, query } = request
    
    let baseAggregate = []
    
    if (user.role == ROLE.ADMIN) {
      baseAggregate = [
        {
          $match: {
            owner: user._id
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
        {
          $unwind: '$owner'
        },
        {
          $lookup: {
            from: 'testings',
            localField: '_id',
            foreignField: 'examId',
            as: 'testings'
          }
        },
        { 
          $lookup: {
            from: 'groups',
            localField: '_id',
            foreignField: 'exams._id',
            as: 'groups'
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            subject: 1,
            code: 1,
            type: 1,
            status: 1,
            createdAt: 1,
            owner: {
              _id: 1,
              prefixName: 1,
              firstName: 1,
              lastName: 1,
              role: 1
            },
            countTestings: { $size: '$testings' },
            groupCount: { $size: '$groups' },
            latestTesting: { $max: '$testings.finishedAt'}
          }
        }
      ]

      const response = await fastify.paginate(fastify.mongoose.Exam, query, baseAggregate)

      const examSuggestion = await fastify.mongoose.ExamSuggestion.findOne({})

      let examSuggestionList = []
      if (examSuggestion) {
        examSuggestionList = examSuggestion.list
      }
       
      response.items = response.items.map(item => {
        return {
          isSuggestion: examSuggestionList.findIndex(es => es.exam.toString() == item._id.toString()) !== -1,
          ...item
        }
      })

      return response

    } else if (user.role == ROLE.STUDENT) {
      baseAggregate = [
        {
          $match: {
            owner: user._id
          }
        },
        {
          $lookup: {
            from: 'testings',
            pipeline: [
              { $match: { userId: user._id } },
              { $project: { examId: 1, updatedAt: 1, userId: 1, groupId: 1, startedAt: 1, finishedAt: 1 } }
            ],
            as: 'testings'
          }
        },
        {
          $addFields: {
            table2: {
              $map: {
                input: '$testings',
                as: 'tbl2',
                in: {
                  _id: '$$tbl2.examId',
                  groupId: '$$tbl2.groupId',
                  updatedAt: '$$tbl2.updatedAt',
                  startedAt: '$$tbl2.startedAt',
                  finishedAt: '$$tbl2.finishedAt',
                }
              }
            }
          }
        },
        {
          $group: {
            _id: null,
            table1: {
              $push: {
                _id: '$_id',
                updatedAt: '$createdAt'
              }
            },
            table2: {
              $first: '$table2'
            }
          }
        },
        {
          $project: {
            items: {
              $setUnion: ['$table1', '$table2']
            }
          }
        },
        {
          $unwind: '$items'
        },
        {
          $replaceRoot: {
            newRoot: '$items'
          }
        },
        {
          $group: {
            _id: {
              examId: '$_id',
              groupId: '$groupId'
            },
            startedAt: { $last: '$startedAt' },
            finishedAt: { $last: '$finishedAt' },
            updatedAt: { $last: '$updatedAt' }
          }
        },
        {
          $lookup: {
            from: 'exams',
            localField: '_id.examId',
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
            localField: 'exam.owner',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $lookup: {
            from: 'groups',
            localField: '_id.groupId',
            foreignField: '_id',
            as: 'group'
          }
        },
        {
          $unwind: {
            path: '$group',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $sort: {
            updatedAt: -1
          }
        }
      ]

      const { page, lastPage, totalCount, items } = await fastify.paginate(fastify.mongoose.Exam, query, baseAggregate)
      // return { totalCount, items }
      return {
        page,
        lastPage,
        totalCount,
        items: items.map(res => ({
          _id: res.exam._id,
          code: res.exam.code,
          subject: res.exam.subject,
          name: res.exam.name,
          type: res.exam.type,
          group: res.group ? {
            _id: res.group._id,
            name: res.group.name
          } : null, 
          owner: {
            _id: res.user._id,
            prefixName: res.user.prefixName,
            firstName: res.user.firstName,
            lastName: res.user.lastName,
            role: res.user.role,
          },
          oneTimeDone: res.exam.oneTimeDone,
          createdAt: res.exam.createdAt,
          status: res.startedAt ? (res.finishedAt ? 'finished' : 'doing') : null
        }))
      }
    } else {
      baseAggregate = [
        {
          $match: {
            owner: user._id
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
            subject: 1,
            code: 1,
            owner: {
              _id: 1,
              prefixName: 1,
              firstName: 1,
              lastName: 1,
              role: 1
            },
            type: 1,
            status: 1,
            createdAt: 1,
          }
        }
      ]
    }
    
    return await fastify.paginate(fastify.mongoose.Exam, query, baseAggregate)
  })

  fastify.get('/all', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN ])
    ]
  }, async (request) => {
    const { query } = request
    
    const baseAggregate = [
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner'
        }
      },
      {
        $unwind: '$owner'
      },
      {
        $lookup: {
          from: 'testings',
          localField: '_id',
          foreignField: 'examId',
          as: 'testings'
        }
      },
      { 
        $lookup: {
          from: 'groups',
          localField: '_id',
          foreignField: 'exams._id',
          as: 'groups'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          subject: 1,
          code: 1,
          type: 1,
          status: 1,
          createdAt: 1,
          owner: {
            _id: 1,
            prefixName: 1,
            firstName: 1,
            lastName: 1,
            role: 1
          },
          countTestings: { $size: '$testings' },
          groupCount: { $size: '$groups' },
          latestTesting: { $max: '$testings.finishedAt'},
        }
      }
    ]

    if (query.search) {
      baseAggregate.push({
        $match: { 
          $or: [
            { name: new RegExp(`${query.search}`, 'i') },
            { code: new RegExp(`${query.search}`, 'i') }
          ]
        }
      })
    }
    
    return await fastify.paginate(fastify.mongoose.Exam, query, baseAggregate)
  })
}
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
    
    if (user.role != ROLE.ADMIN) {
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
          $lookup: {
            from: 'testings',
            let: { id: '$_id' },
            pipeline: [
              { 
                $match: {
                  $expr: {
                    $eq: ['$examId', '$$id']
                  }
                }
              },
              { $sort: { finishedAt : 1 } },
              { $limit: 1 }
            ],
            as: 'testing'
          }
        },
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
            testing: 1,
            type: 1,
            status: 1,
            oneTimeDone: 1,
            createdAt: 1,
          }
        }
      ]
    } else {
      baseAggregate = [
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
            latestTesting: { $max: '$testings.finishedAt'}
          }
        }
      ]
    }

    if (!query.limit) {
      query.limit = 100
    }

    const response = await fastify.paginate(fastify.mongoose.Exam, query, baseAggregate)

    if (user.role == ROLE.ADMIN) {
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
    }

    return response
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
          latestTesting: { $max: '$testings.finishedAt'}
        }
      }
    ]

    if (query.search) {
      baseAggregate.push({
        $match: { 
          $or: [
            { name: new RegExp(`^${query.search}`, 'i') },
            { code: new RegExp(`^${query.search}`, 'i') }
          ]
        }
      })
    }
    
    return await fastify.paginate(fastify.mongoose.Exam, query, baseAggregate)
  })
}
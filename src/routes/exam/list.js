'use strict' 

const { ROLE } = require('@config/user')

module.exports = async (fastify, opts) => {
  fastify.get('/', {
    preValidation: [
      fastify.authenticate()
    ]
  }, async (request) => {
    const { user, query } = request
    
    let baseAggregate = []
    
    if (user.role == ROLE.STUDENT) {
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
          $lookup: {
            from: 'testings',
            let: { id: '$_id' },
            pipeline: [
              { 
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$examId', '$$id'] },
                      { $eq: ['$finishedAt', null ]}
                    ]
                  }
                }
              },
              { $project: { _id : 1 } }
            ],
            as: 'latestTesting'
          }
        },
        { $unwind: "$owner" },
        { $unwind: { path: "$latestTesting", "preserveNullAndEmptyArrays": true } },
        {
          $project: { 
            _id: 1,
            name: 1,
            subject: 1,
            code: 1,
            owner: {
              prefixName: 1,
              firstName: 1,
              lastName: 1,
              role: 1
            },
            latestTesting: 1,
            type: 1,
            status: 1,
            createdAt: 1,
          }
        }
      ]
    } else if (user.role == ROLE.ADMIN) {
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
              role: 1,
              name: { $concat: ['$owner.firstName', ' ', '$owner.lastName'] }
            },
            countTestings: { $size: '$testings' },
            latestTesting: { $max: '$testings.finishedAt'}
          }
        }
      ]
    }
    else {
      baseAggregate = [
        {
          $match: {
            owner: user._id
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
          }
        }
      ]
    }
    if (!query.limit) {
      query.limit = 100
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
        $project: {
          _id: 1,
          name: 1,
          subject: 1,
          code: 1,
          type: 1,
          status: 1,
          createdAt: 1,
          owner: {
            role: 1,
            name: { $concat: ['$owner.firstName', ' ', '$owner.lastName'] }
          },
          countTestings: { $size: '$testings' },
          latestTesting: { $max: '$testings.finishedAt'}
        }
      }
    ]

    return await fastify.paginate(fastify.mongoose.Exam, query, baseAggregate)
  })
}
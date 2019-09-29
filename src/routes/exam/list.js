'use strict' 
const mongoose = require('mongoose')
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
        // {
        //   $replaceRoot: { 
        //     newRoot: { 
        //       $mergeObjects: [ 
        //         { $arrayElemAt: [ "$latestTesting", 0 ] },
        //         "$$ROOT"
        //       ]
        //     }
        //   }
        // },
        { $unwind: "$owner" },
        { $unwind: "$latestTesting" },
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
    } else {
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
}

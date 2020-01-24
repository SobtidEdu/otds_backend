'use strict' 

const { ROLE } = require('@config/user')
const mongoose = require('mongoose')

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
            owner: user._id,
            deletedAt: null
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
            _id: user._id
          }
        },
        { $unwind: '$myExam' },
        { $replaceRoot: { newRoot: '$myExam' } },
        { $sort: { latestAction: -1 } },
        {
          $lookup: {
            from: 'exams',
            localField: 'examId',
            foreignField: '_id',
            as: 'exam'
          }
        },
        { $unwind: '$exam' },
        {
          $lookup: {
            from: 'users',
            localField: 'exam.owner',
            foreignField: '_id',
            as: 'owner'
          }
        },
        { $unwind: '$owner' },
        {
          $lookup: {
            from: 'groups',
            localField: 'groupId',
            foreignField: '_id',
            as: 'group'
          }
        },
        { $unwind: { path: '$group', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'testings',
            let: { examId: "$examId", groupId: "$groupId" },
            pipeline: [
              {
                $match: {
                  $expr: { 
                    $and: [
                      { $eq: [ '$examId', '$$examId' ] },
                      { $cond: [ { $eq: [ "$$groupId", null ] } , { $eq: [ '$groupId', null ] }, { $eq : [ '$groupId', '$$groupId' ] } ] },
                    ]
                  }
                }
              },
              { $project: { _id: 1, startedAt: 1, finishedAt: 1, examId: 1, userId: 1, groupId: 1 } },
              { $sort: { startedAt: -1 } },
              { $limit: 1 }
            ],
            as: 'testing'
          }
        },
        { $unwind: { path: '$testing', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: "$exam._id",
            code: "$exam.code",
            subject: "$exam.student",
            name: "$exam.name",
            type: "$exam.type",
            group: {
              _id: 1,
              name: 1
            },
            owner: {
                _id: 1,
                prefixName: 1,
                firstName: 1,
                lastName: 1,
                role: 1
            },
            oneTimeDone: "$exam.oneTimeDone",
            status: "$exam.status",
            startedAt: "$testing.startedAt",
            finishedAt: "$testing.finishedAt",
            createdAt: "$exam.createdAt"
          }
        }
      ]

      // return fastify.mongoose.User.aggregate(baseAggregate)

      const { page, lastPage, totalCount, items } = await fastify.paginate(fastify.mongoose.User, query, baseAggregate)
      
      return {
        page,
        lastPage,
        totalCount,
        items: items.map(res => ({
          ...res,
          status: res.status ? (res.startedAt ? (res.finishedAt ? 'finished' : 'doing') : null) : 'close',
        }))
      }
    } else {
      baseAggregate = [
        {
          $match: {
            owner: user._id,
            deletedAt: null
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
        $match: {
          deletedAt: null
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
  })
}
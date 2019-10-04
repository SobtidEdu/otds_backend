'use strict'

const { ROLE, GROUP_STATUS } = require('@config/user')
const { STUDENT_STATUS } = require('@config/group')

module.exports = async (fastify, options) => {

  fastify.get('/', {
    preValidation: [
      fastify.authenticate()
    ]
  }, async (request) => {

    const { user } = request;

    if (user.role === ROLE.STUDENT) {
      const aggregate = [
        { 
          $match: { 
            $and: [
              { userId: { $eq: user._id } },
              { finishedAt: { $ne: null } }
            ]
          }
        },
        { 
          $group: { 
            _id: "$examId", 
            startedAt: { $last: "$startedAt" },
            latestScore: { $last: "$score" }
          }
        },
        {
          $lookup: {
            from: 'exams',
            localField: '_id',
            foreignField: '_id',
            as: 'exam'
          }
        },
        {
          $unwind: '$exam'
        },
        {
          $project: {
            exam: {
              _id: 1,
              code: 1,
              name: 1,
              subject: 1,
              type: 1
            },
            latestScore: 1,
            startedAt: 1
          }
        }
      ]

      const response = await fastify.mongoose.Testing.aggregate(aggregate) // FIXME : Refactor ควรจะจัดการใน aggregate
      return response.map(res => ({
        _id: res.exam._id,
        code: res.exam.code,
        name: res.exam.name,
        subject: res.exam.subject,
        type: res.exam.type,
        latestScore: res.latestScore,
        startedAt: res.startedAt
      }))
    } else {

      // FIXME : ให้สร้าง logic จาก aggregate
      const aggregate = [
        { 
          $match: { 
            owner: { $eq: user._id }
          }
        },
        {
          $lookup: {
            from: 'testings',
            localField: '_id',
            foreignField: 'examId',
            as: 'testings'
          }
        },
        // {
        //   $addFields: {
        //     totalStudent: { $size: "$testings" }
        //   }
        // },
        // { 
        //   $group: { 
        //     _id: "$_id", 
        //     code: { $last: "$code"}, 
        //     name: { $last: "$name"}, 
        //     subject: { $last: "$subject"}, 
        //     type: { $last: "$type"}, 
        //     totalStudent: { $last: "$totalStudent" },
        //     // totalStudent: { $sum: "$testings" },
        //     // startedAt: { $last: "$testings.startedAt" },
        //     minScore: { $min: "$testing.score" },
        //     // averageScore: { $avg: "$testing.score"},
        //     // maxScore: { $max: "$testing.score" }
        //   }
        // },
        {
          $project: {
            _id: 1,
            code: 1,
            name: 1,
            subject: 1,
            type: 1,
            testings: 1
          }
        }
      ]

      const exams = await fastify.mongoose.Exam.aggregate(aggregate)
      return exams.map(exam => {
        let testingsLatest = []
        exam.testings.forEach(testing => {
          if (testing.finishedAt !== null) {
            const testingdLatestIndex = testingsLatest.findIndex(tl => tl.userId == testing.userId.toString())
            if (testingdLatestIndex > -1) {
              testingsLatest[testingdLatestIndex] = testing
            } else {
              testingsLatest.push(testing)
            }
          }
        })
        
        let latestTestAt = null
        let maxScore = 0
        let minScore = 0
        let avgScore = 0

        if (testingsLatest.length > 0) {
           latestTestAt = testingsLatest[testingsLatest.length-1].startedAt
           maxScore = testingsLatest.reduce((acc, item) => item.score > acc  ? item.score : acc, 0)
           minScore = testingsLatest.reduce((acc, item) => item.score < acc  ? item.score : acc, maxScore)
           avgScore = testingsLatest.reduce((acc, item) => item.score + acc, 0) / testingsLatest.length
        }

        return {
          _id: exam._id,
          code: exam.code,
          name: exam.name,
          subject: exam.subject,
          type: exam.type,
          latestTestAt,
          totalStudent: testingsLatest.length,
          minScore,
          maxScore,
          avgScore
        }
      })
    }
  })

  // fastify.get('/rescore', {
  //   preValidation: [
  //     fastify.authenticate()
  //   ]
  // }, async (request) => {
  //   let testings = await fastify.mongoose.Testing.find({ finishedAt: {$ne: null} }).lean()

  //   for (let testing of testings) {
  //     const score = testing.progressTestings.reduce((total, pt) => total + (pt.isCorrect ? 1 : 0), 0)
  //     await fastify.mongoose.Testing.updateOne(
  //       { _id: testing._id }, 
  //       { score }
  //     )
  //   }

  //   return { message: 'success' }
  // })
}
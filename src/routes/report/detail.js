'use strict'

const { ROLE, GROUP_STATUS } = require('@config/user')
const { STUDENT_STATUS } = require('@config/group')

var mongoose = require('mongoose');

module.exports = async (fastify, options) => {

  fastify.get('/:examId', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ROLE.STUDENT])
    ]
  }, async (request) => {
    const { user, params } = request

    const aggregate = [
      {
        $match: { 
          examId: mongoose.Types.ObjectId(params.examId),
          userId: mongoose.Types.ObjectId(user._id),
          finishedAt: { $ne: null }
        }
      }
    ]
    
    const response = await fastify.mongoose.Testing.aggregate(aggregate)
    // return response
    return response.map(data => ({
      testingId: data._id,
      startedAt: data.startedAt,
      finishedAt: data.finishedAt,
      score: data.score
    }))
  })

  fastify.get('/:examId/static/lesson', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ROLE.STUDENT])
    ]
  }, async (request) => {
    const { user, params } = request

    const aggregate = [
      {
        $match: { 
          examId: mongoose.Types.ObjectId(params.examId),
          userId: mongoose.Types.ObjectId(user._id),
          finishedAt: { $ne: null }
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
      }
    ]

    const response = await fastify.mongoose.Testing.aggregate(aggregate)
    if (response.length < 1) throw fastify.httpErrors.notFound('ไม่พบการทำสอบรายการนี้')

    const examStat = response[0]
    const lessons = await fastify.otimsApi.getLessons({ learning_area: examStat.exam.subject, key_stage: examStat.exam.grade })
    
    const stats = []

    examStat.exam.questions.forEach((question) => {
      let lessonName = '-'
      if (question.lessonId) {
        const lessonFound = lessons.find(l => l.id == question.lessonId)
        lessonName = lessonFound ? lessonFound.name : '-'
      }

      const testing = examStat.progressTestings.find(t => t.questionId == question._id)

      const statIndex = stats.findIndex(s => s.lesson == lessonName)
      if (statIndex > -1) {
        stats[statIndex].score += testing ? (testing.isCorrect ? 1 : 0) : 0
        stats[statIndex].total_score += 1
      } else {
        stats.push({
          lesson: lessonName,
          score: testing ? (testing.isCorrect ? 1 : 0) : 0,
          total_score: 1
        })
      }
    })

    let score = stats.map((stat, index) => [index+1, stat.score, stat.total_score])
    score.unshift(['ลำดับ', 'คะแนน', 'คะแนนเต็ม'])

    let lesson = stats.map(stat => stat.lesson)
    
    return { score, lesson }
    // return stats
  })
}
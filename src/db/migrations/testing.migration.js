'use strict'
const moment = require('moment')
const { connectMongodb } = require('./mongo-connection')

module.exports = {
  sync: async (synchronizer, continueRound) => {
    console.log('Synchonizing exam .....')
    const { mongoConnection, mongodb } = await connectMongodb()
    synchronizer.setSqlQueryCmd(`SELECT * FROM xml_student_exam_progress WHERE is_finish = '1' AND is_delete = '0'`)
    synchronizer.setMongoCollection('testings')

    await synchronizer.synchronize(50, continueRound, async (from, to) => {
      const exam = await mongodb.collection('exams').findOne({ code: from.exam_id })
      if (!exam) {
        return null
      }

      const user = await mongodb.collection('users').findOne({ oldSystemId: from.student_id })
      
      to.isOldSystem = true
      to.startedAt = moment(from.create_date).unix()
      to.history = [{ startDate: to.startedAt }]
      to.finishedAt = moment(from.create_date).add(from.time_used, 's').unix()
      to.examId = exam._id
      to.userId = user ? user._id : null
      to.score = from.score
      to.theta = from.cat_final_theta
      to.se = null
      to.time = from.time_used * 1000
      console.log(from.exam_id)
      to.progressTestings = transformAnswer(exam.questions, from.answers)
      return to
    })
    await mongoConnection.close()
    console.log('exam synchonized .....')
  },
  clear: async (mongodb) => {
    console.log('Clearing exam .....')
    
    try {
      await mongodb.collection('exams').deleteMany({ isOldSystem: true })
    } catch (err) {
      if (err.code === 26) console.log('There isn\'t the exam collection')
      else console.log(err)
    }
    
    console.log('Cleared exam .....')
  }
}

const transformAnswer = (questions, answers) => {
  answers = answers.replace(/\\/g, '\\\\')
  // answers = answers.replace(']', '\\]')
  // answers = answers.replace('\\]', '\\\\]')
  answers = JSON.parse(answers)
  console.log(answers)
  // return []
  return questions.map(question => {
    const progressTesting = {
      order: question.seq,
      questionId: question.id,
      answer: null,
      isCorrect: false
    }
    let answer =  typeof answers === 'object' && answers !== null ? answers[question.seq] : null
    if (answer) {
      switch (question.type) {
        case 'MC':
          progressTesting.answer = answer
          progressTesting.isCorrect = checkCorrect(question, answer)
          break;
        case 'SA':
          progressTesting.answer = answer
          progressTesting.isCorrect = checkCorrect(question, answer)
          break;
        case 'MA':
          console.log('original answers from old system for MA type: ', answer)
          progressTesting.answer = answer.split(',').filter(ans => ans !== '').map((ans, i) => ({ seq: i+1, match: ans }))
          progressTesting.isCorrect = checkCorrect(question, progressTesting.answer)
          break;
        case 'TF': 
          console.log('original answers from old system for TF type: ', answer)
          progressTesting.answer = answer.split(',').filter(ans => ans !== '').map(ans => ({ key: ans }))
          progressTesting.isCorrect = checkCorrect(question, progressTesting.answer)
          break;
      }
    }
    
    return progressTesting
  })
}

const checkCorrect = (question, userAnswer) => {
  if (!userAnswer) return false
  switch (question.type) {
    case 'MC':
      const MCAnswer = question.answers.find(originalAnswer => originalAnswer.seq == userAnswer)
      return MCAnswer ? MCAnswer.key : false
    case 'SA':
      const SAAnswer = question.answers.find(originalAnswer => {
        originalAnswer.key = originalAnswer.key.replace('<p>', '')
        originalAnswer.key = originalAnswer.key.replace('</p>', '')
        return originalAnswer.key === userAnswer
      })
      return SAAnswer ? true : false
    case 'MA':
      for (let questionAnswer of question.answers.left) {
        if (userAnswer.findIndex(ans => ans.seq == questionAnswer.seq && ans.match == questionAnswer.match) === -1)
          return false
      }
      return true
    case 'TF': 
      for (let index in question.subQuestions) {
        let optionIndex = question.subQuestions[index].answers.findIndex(answer => answer.seq == userAnswer[index].key)
        if (optionIndex === -1 || question.subQuestions[index].answers[optionIndex].key === false) {
          return false
        }
      }
      return true
    default : return false
  }
}
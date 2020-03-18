'use strict'
const moment = require('moment')
const { connectMongodb } = require('./mongo-connection')
const mysql = require('./mysql-connection')

module.exports = {
  sync: async (synchronizer, continueRound) => {
    console.log('Synchonizing exam .....')
    const { mongoConnection, mongodb } = await connectMongodb()
    synchronizer.setSqlQueryCmd("SELECT * FROM xml_result_teacher WHERE is_delete = '0'")
    synchronizer.setMongoCollection('exams')

    await synchronizer.synchronize(20, continueRound, async (from, to) => {
      const user = await mongodb.collection('users').findOne({ oldSystemId: from.user_id })
      if (!user) {
        return null
      }
      let rawQuestion = await mysql.query(`SELECT txt_xml FROM ot_exam_xml WHERE code = '${from.code}'`)
      // console.log(from.code)
      // console.log(rawQuestion[0].txt_xml)
      rawQuestion = rawQuestion[0] ? JSON.parse(rawQuestion[0].txt_xml) : null
      
      to.owner = user._id
      to.oldSystemId = from.id
      to.otimsCode = from.TestSetID
      to.code = from.code
      to.subject = from.learning_area
      to.grade = from.key_stage
      to.type = from.TestType
      to.name = from.name
      to.status = from.status == 1
      if (rawQuestion && !Array.isArray(rawQuestion.ResponseItemGroup)) rawQuestion.ResponseItemGroup = [rawQuestion.ResponseItemGroup]
      to.questions = rawQuestion ? rawQuestion.ResponseItemGroup.filter(question => question !== undefined && question !== {}).map(question => {
        // console.log(question)
        return {
          seq: question.ItemSeq ? question.ItemSeq : '',
          id: question.ItemID,
          type: question.QuestionType,
          text: question.ItemQuestion,
          suggestedTime: parseFloat(question.SuggestedTime),
          explanation: question.Explanation,
          lessonId: question.Lessons ? question.Lessons : null,
          unit: question.QuestionType === 'SA' ?  question.ItemShortAnswer_ResponseItemGroup.Unit : '',
          answers: question.QuestionType !== 'TF' ? transformAnswerByQuestionType(question) : [],
          subQuestions: question.QuestionType === 'TF' ? [{
            no: null,
            text: '',
            answers: question.ItemTrueFalseChoice_ResponseItemGroup ? question.ItemTrueFalseChoice_ResponseItemGroup.ItemTrueFalseChoice.map(subAnswer => ({
              seq: subAnswer.ItemChoiceSeq,
              text: subAnswer.ItemChoice,
              key: subAnswer.ItemChoiceKey === 'True'
            })) : []
          }] : []
        }
      }): []
      to.quantity = to.questions.length
      to.examSetTotal = from.ri_set_count
      to.criterion = 'none'
      to.duration = (from.timing_hr*60*60) + (from.timing_min*60)
      to.displayHowTo = false
      to.displaySolution = from.exam_answer_explaination
      to.oneTimeDone = false
      to.isSuggestion = from.recommend
      to.competition = {
        years: []
      }
      if (to.type == 'C') {
        to.competition = {
          project: from.competition_id,
          years: [from.from_year, from.to_year]
        }
      }
      
      to.createdAt = moment().unix()
      // console.log(to)
      return to
    })
    await mongoConnection.close()
    console.log('exam synchonized .....')
  },
  clear: async (mongodb) => {
    console.log('Clearing exam .....')
    
    try {
      await mongodb.collection('exams').deleteMany({ oldSystemId: { $exists: true } })
    } catch (err) {
      if (err.code === 26) console.log('There isn\'t the exam collection')
      else console.log(err)
    }
    
    console.log('Cleared exam .....')
  }
}

const transformAnswerByQuestionType = (question) => {
  switch (question.QuestionType) {
    case 'MC': return question.ItemChoice_ResponseItemGroup.ItemChoice.map(answerChoice => ({
      seq: answerChoice.ItemChoiceSeq,
      text: answerChoice.ItemChoice,
      key: answerChoice.ItemChoiceKey === 'True',
    }))
    case 'SA': 
      if (!Array.isArray(question.ItemShortAnswer_ResponseItemGroup.ItemShortAnswer)) {
        question.ItemShortAnswer_ResponseItemGroup.ItemShortAnswer = [question.ItemShortAnswer_ResponseItemGroup.ItemShortAnswer]
      }
      return question.ItemShortAnswer_ResponseItemGroup.ItemShortAnswer.map(answer => ({
        seq: answer.ItemAnswerSeq,
        key: answer.ItemAnswer,
        operation: answer.ItemAnswerOperation
      }))
    case 'MA': return {
      left: question.ItemMatchingQuestion_ResponseItemGroup.ItemMatchingQuestion.map(answer => ({
        seq: answer.ItemLeftSideSeq,
        text: answer.ItemLeftSide,
        match: answer.ItemRightSideKey
      })),
      right: question.ItemMatchingChoice_ResponseItemGroup.ItemMatchingChoice.map(answer => ({
        seq: answer.ItemRightSideSeq,
        text: answer.ItemRightSide,
      }))
    }
  }
}
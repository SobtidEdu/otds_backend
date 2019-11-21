'use strict'
const moment = require('moment')
const { connectMongodb } = require('./mongo-connection')
const mysql = require('./mysql-connection')

module.exports = {
  sync: async (synchronizer) => {
    console.log('Synchonizing exam .....')
    const { mongoConnection, mongodb } = await connectMongodb()
    synchronizer.setSqlQueryCmd('SELECT * FROM xml_result_teacher')
    synchronizer.setMongoCollection('exams')

    await synchronizer.synchronize(1000, async (from, to) => {
      const user = await mongodb.collection('users').findOne({ oldSystemId: from.user_id })
      let rawQuestion = await mysql.query(`SELECT txt_xml FROM ot_exam_xml WHERE code = '${from.code}'`)
      rawQuestion = rawQuestion[0] ? JSON.parse(rawQuestion[0].txt_xml) : []
      
      to.owner = user._id
      to.code = from.TestSetID
      to.subject = from.learning_area
      to.grade = from.key_stage
      to.type = from.TestType
      to.name = from.name
      to.status = from.status == 1
      to.questions = rawQuestion.ResponseItemGroup ? rawQuestion.ResponseItemGroup.map(question => ({
        seq: question.ItemSeq,
        id: question.ItemID,
        type: question.QuestionType,
        text: question.ItemQuestion,
        suggestedTime: parseFloat(question.SuggestedTime),
        explanation: question.Explanation,
        lessonId: question.Lessons ? question.Lessons : null,
        unit: question.QuestionType === 'SA' ?  question.ItemShortAnswer_ResponseItemGroup.Unit : '',
        answers: question.QuestionType !== 'TF' ? transformAnswerByQuestionType(question) : [],
        subQuestions: question.QuestionType === 'TF' ? question.ItemTFSubquestion_ResponseItemGroup.ItemTFSubquestion.map(subQuestion => ({
          no: subQuestion.ItemNo,
          text: subQuestion.ItemSubQuestion,
          answers: subQuestion.ItemTFChoice_ItemTFSubquestion.ItemTFChoice.map(subAnswer => ({
            seq: subAnswer.ItemChoiceSeq,
            text: subAnswer.ItemChoice,
            key: subAnswer.ItemChoiceKey === 'True'
          }))
        })) : []
      })) : []
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
      console.log(to)
      return to
    })
    await mongoConnection.close()
    console.log('exam synchonized .....')
  },
  clear: async (mongodb) => {
    console.log('Clearing user .....')
    
    try {
      await mongodb.collection('users').drop()
    } catch (err) {
      if (err.code === 26) console.log('There isn\'t the user collection')
      else console.log(err)
    }
    
    console.log('Cleared user .....')
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
'use strict' 

const { ROLE } = require('@config/user')
const { CRITERION, EXAM_TYPE, LEVEL } = require('@config/exam')
const moment = require('moment')

module.exports = async (fastify) => { 

  const schema = {}

  fastify.post('/', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ]
  }, async (request) => {
    
    const { user, body } = request
    
    const examSet = new fastify.mongoose.ExamSet(body)

    body.owner = user._id
    body.bankType = body.bankType ? fastify.utils.capitalize(body.bankType) : 'Public'
    
    const params = mapExamParams(user, body)

    const exams = await fastify.otimsApi.createExamset(params)

    let firstExam

    for (let i in exams) {  //.forEach(async (exam, index) => {
      let data = body
      if (data.examSetTotal > 1) {
        data.name = data.name + ` (ชุดที่ ${index+1})`
      }
      data.code = exams[i].TestSetID,
      data.questions = exams[i].ResponseItemGroup_ResponseTestsetGroup.ResponseItemGroup.map(question => ({
        seq: question.ItemSeq,
        id: question.ItemID,
        type: question.QuestionType,
        text: question.ItemQuestion,
        suggestedTime: parseFloat(question.SuggestedTime),
        explanation: question.Explanation,
        answers: transformAnswerByQuestionType(question)
      }))

      if (index = 0) {
        firstExam = await fastify.mongoose.ExamSet.create(data)
      } else {
        await fastify.mongoose.ExamSet.create(data)
      }
    }

    return firstExam
  })
}

const mapExamParams = (user, params) => {
  if (params.type == EXAM_TYPE.GENERAL) return generalExamType(user, params)
}

const generalExamType = (user, params) => {
  const exam = {
    RequestType: getRequestType(user),
    TestSetType: getTestSetType(params.examSetTotal),
    ItemType: params.type,
    KeyStage: params.grade,
    LearningArea: params.subject,
    NoItems: params.quantity,
    ComplexityLevel: getCompleixityLevel(params.level),
    BankType: params.bankType,
    FollowIndicator: false, // Initial
    FollowStrand: false, // Initial
    FollowLesson: false, // Initial
    NoStudents: params.examSetTotal
  }

  Object.assign(exam, mapCriterion(params))

  return exam
}

const getRequestType = (user) => user.role == ROLE.STUDENT ? 2 : 1

const getTestSetType = (quantity) => quantity > 1 ? 'RI' : 'FI'

const getCompleixityLevel = (level) => level.map(l => {
  switch (l) {
    case LEVEL.EASY: return 1
    case LEVEL.NORMAL: return 2
    case LEVEL.HARD: return 3
  }
}).join(',')

const mapCriterion = (params) => {
  switch (params.criterion) {
    case CRITERION.LESSON:
      return {
        FollowLesson: true,
        Lesson: params.lessons.map(lesson => `${lesson.code},${lesson.quantity}`).join(';')
      }
    case CRITERION.INDICATOR:
      return {
        FollowIndicator: true,
        Indicator: params.indicators.map(indicator => `${indicator.code},${indicator.quantity}`).join(';')
      }
    case CRITERION.STRAND:
      return {
        FollowStrand: true,
        Strand: params.strands.map(strand => `${strand.code},${strand.quantity}`).join(';')
      }
    default: return {}
  }
}

const transformAnswerByQuestionType = (question) => {
  switch (question.QuestionType) {
    case 'MC': return question.ItemChoice_ResponseItemGroup.ItemChoice.map(answerChoice => ({
      seq: answerChoice.ItemChoiceSeq,
      text: answerChoice.ItemChoice,
      key: answerChoice.ItemChoiceKey === 'True',
    }))
    case 'SA': return question.ItemShortAnswer_ResponseItemGroup.ItemShortAnswer.map(answer => ({
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
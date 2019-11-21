'use strict' 

const { ROLE } = require('@config/user')
const { CRITERION, EXAM_TYPE, LEVEL } = require('@config/exam')

module.exports = async (fastify) => { 

  const schema = {}

  fastify.post('/', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate({ allowGuest: true })
    ]
  }, async (request) => {
    const { user, body } = request
    let exams = null

    body.owner = user._id
    body.bankType = body.bankType ? fastify.utils.capitalize(body.bankType) : 'Public'
    
    const params = mapExamParams(user, body)

    if (body.type == EXAM_TYPE.GENERAL || body.type == EXAM_TYPE.COMPETITION) {
      exams = await fastify.otimsApi.requestFixedRandomTestSet(params)
    } else if (body.type == EXAM_TYPE.CAT) {
      exams = await fastify.otimsApi.requestFirstItemCAT(params)
    } else if (body.type == EXAM_TYPE.CUSTOM) {
      exams = await fastify.otimsApi.requestCustomTestSet(params)
    }

    if (!Array.isArray(exams)) {
      exams = [exams]
    }

    exams = exams.map((exam, i) => {
      let data = Object.assign({}, body)
      if (data.examSetTotal > 1) {
        data.name = body.name + ` (ชุดที่ ${parseInt(i)+1})`
      }
      
      data.code = exam.TestSetID
      
      if (data.type == 'CAT') {
        data.oneTimeDone = true
        data.withoutRegistered = false
        data.displayHowTo = false
        data.displaySolution = false
        const { answers, type } = transformAnswerCAT(exam)
        data.questions = [{
          seq: exam.ItemSeq,
          id: exam.ItemID,
          answers,
          type,
          text: exam.ItemQuestion,
          suggestedTime: exam.SuggestedTime,
          explanation: exam.Explanation,
        }]
      } else {
        let { ResponseItemGroup } = exam.ResponseItemGroup_ResponseTestsetGroup
        if (!Array.isArray(exam.ResponseItemGroup_ResponseTestsetGroup.ResponseItemGroup)) {
          ResponseItemGroup = [ResponseItemGroup]
        }
        data.questions = ResponseItemGroup.map(question => ({
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
        }))  
        data.quantity = data.questions.length
      }

      return data
    })

    const response = await fastify.mongoose.Exam.create(exams)

    return response
  })
}

const mapExamParams = (user, params) => {
  const exam = {
    RequestType: getRequestType(user),
    TestSetType: getTestSetType(params.examSetTotal),
    ItemType: params.type,
    KeyStage: params.grade,
    LearningArea: params.subject,
    NoItems: params.quantity,
    ComplexityLevel: params.level ? getCompleixityLevel(params.level) : '',
    BankType: params.bankType,
    FollowIndicator: false,
    FollowStrand: false,
    FollowLesson: false,
    NoStudents: params.examSetTotal
  }

  if (params.type === EXAM_TYPE.COMPETITION) {
    exam.Project = params.competition.project,
    exam.ProjectYear = params.competition.years.join(',')
  }

  if (params.type === EXAM_TYPE.CUSTOM) {
    exam.TestItems = params.testItems
  }

  Object.assign(exam, mapCriterion(params))

  return exam
}

const getRequestType = (user) => user.role == ROLE.STUDENT ? 2 : 1

const getTestSetType = (examSetTotal) => examSetTotal > 1 ? 'RI' : 'FI'

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
        Lesson: params.lessons.map(lesson => `${lesson.code},ALL,${lesson.quantity}`).join(';')
      }
    case CRITERION.INDICATOR:
      return {
        FollowIndicator: true,
        Indicator: params.indicators.map(indicator => `${indicator.code},ALL,${indicator.quantity}`).join(';')
      }
    case CRITERION.STRAND:
      return {
        FollowStrand: true,
        Strand: params.strands.map(strand => `${strand.code},ALL,${strand.quantity}`).join(';')
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

const transformAnswerCAT = (exam) => {
  const { ItemChoiceCAT_ResponseFirstItemCAT } = exam
  if (ItemChoiceCAT_ResponseFirstItemCAT) {
    return { 
      answers: ItemChoiceCAT_ResponseFirstItemCAT.ItemChoiceCAT.map(answer => ({
        seq: answer.ItemChoiceSeq,
        text: answer.ItemChoice,
        key: answer.ItemChoiceKey === 'True',
      })),
      type: 'MC'
    }
  }
}
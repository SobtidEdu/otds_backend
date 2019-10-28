'use strict' 

const { ROLE } = require('@config/user')
const { CRITERION, EXAM_TYPE, LEVEL } = require('@config/exam')
const moment = require('moment')

module.exports = async (fastify) => { 

  const schema = {}

  fastify.delete('/:examId', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ]
  }, async (request) => {
    
    const { user, params } = request

    let deleteExam = null;
    if (user.role === ROLE.ADMIN) {
      deleteExam = fastify.mongoose.Exam.deleteOne({ _id: params.examId })
    } else {
      deleteExam = fastify.mongoose.Exam.deleteOne({ _id: params.examId, owner: user._id })
    }
    

    await Promise.all([
      deleteExam,
      fastify.mongoose.Testing.deleteMany({ examId: params.examId }),
      fastify.mongoose.Group.updateMany({ 
        exams: { 
          $elemMatch: {
            _id: params.examId
          } 
        }
      }, { $pull: { exams: { _id: params.examId } } }),
      fastify.mongoose.ExamSuggestion.update({}, { $pull: { list: { exam: params.examId } } }),
    ])
    
    return { message: 'Exam has been deleted' }
  })
}
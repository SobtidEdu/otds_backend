'use strict' 

const { ROLE } = require('@config/user')
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
      deleteExam = fastify.mongoose.Exam.updateOne({ _id: params.examId }, { deletedAt: moment().unix() })
    } else if (user.role === ROLE.TEACHER || user.role === ROLE.SUPER_TEACHER) {
      deleteExam = fastify.mongoose.Exam.updateOne({ _id: params.examId, owner: user._id }, { deletedAt: moment().unix() })
    }

    if (user.role === ROLE.STUDENT) {
      await Promise.all([
       fastify.mongoose.User.update({}, { $pull: { myExam: { examId: params.examId, groupId: params.groupId | null } } }),
       fastify.mongoose.Testing.updateMany({ examId: params.examId, userId: user._id, groupId: params.groupId | null }, { deletedAt: moment().unix() }),
       fastify.mongoose.Exam.updateOne({ _id: params.examId, owner: user._id }, { deletedAt: moment().unix() })
      ])
    } else {
      await Promise.all([
        deleteExam,
        fastify.mongoose.Testing.updateMany({ examId: params.examId, userId: user._id }, { deletedAt: moment().unix() }),
        fastify.mongoose.Group.updateMany({ 
          exams: { 
            $elemMatch: {
              _id: params.examId
            }
          }
        }, { $pull: { exams: { _id: params.examId } } }),
        fastify.mongoose.ExamSuggestion.update({}, { $pull: { list: { exam: params.examId } } }),
        fastify.mongoose.User.update({ _id: user._id }, { $pull: { myExam: { examId: params.examId } } }),
      ])
    }
    
    return { message: 'Exam has been deleted' }
  })
}
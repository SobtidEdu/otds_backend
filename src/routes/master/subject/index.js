'use strict' 

const subjectList = require('./list')
const subjectCreate = require('./create')

module.exports = async (fastify, opts) => { 

  if (await fastify.mongoose.ExamConfiguration.countDocuments({ type: 'SUBJECT' }) == 0) {
    const initialExamConfiguration = require('./initial.json');
    await fastify.mongoose.ExamConfiguration.create({ type: 'SUBJECT', data: initialExamConfiguration })
  }

  fastify.register(require('./list'))
  fastify.register(require('./create'))
  fastify.register(require('./update'))
}

'use strict' 

const subjectList = require('./list')
const subjectCreate = require('./create')

module.exports = async (fastify, opts) => { 

  if (await fastify.mongoose.Subject.countDocuments() == 0) {
    const initialSubjects = require('./initial.json');
    for (let i = 0; i < initialSubjects.length; i++) {
      await fastify.mongoose.Subject.create(initialSubjects[i])  
    }
  }

  fastify.register(subjectList)
  fastify.register(subjectCreate)
}

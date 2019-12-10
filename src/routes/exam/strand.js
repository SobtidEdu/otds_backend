'use strict' 

const moemnt = require('moment')

module.exports = async (fastify) => { 

  const schema = {}

  fastify.get('/strands', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ]
  }, async (request) => {
    const { user, query } = request
    const params = {}

    params.ItemType = query.type ? query.type : 'C'
    if (query.subject) {
      params.LearningArea = query.subject
    }
    if (query.grade) {
      params.KeyStage = query.grade
    }
    if (query.competitionName) {
      params.Project = query.competitionName
    }
    if (query.competitionYears) {
      params.ProjectYear = query.competitionYears.join(',')
    }

    return await fastify.otimsApi.getStrands(params)
  })
}
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
    if (query.competition.name) {
      params.Project = query.competition.name
    }
    if (query.competition.year) {
      params.ProjectYear = query.competition.year
    }
    params.ProjectName = query.ProjectName || ''
    params.BankType = query.BankType || 'Public'

    const response = await fastify.otimsApi.getStrands(params)
    return response.filter(strand => !strand.code.startsWith('51'))
  })
}
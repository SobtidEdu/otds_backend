'use strict' 

const moemnt = require('moment')

module.exports = async (fastify) => { 

  const schema = {}

  fastify.get('/indicators', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ]
  }, async (request) => {
    const { user, query } = request
    const params = {}

    params.ItemType = query.type ? query.type : 'G'
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
      params.ProjectYear = query.competitionYears
    }

    const response = await fastify.otimsApi.getIndicators(params)

    return response.filter(strand => !strand.code.startsWith('51')).map(strand => strand.indicators.sort((a,b) => parseInt(a.code.split('/')[1]) - parseInt(b.code.split('/')[1]) ))
  })
}
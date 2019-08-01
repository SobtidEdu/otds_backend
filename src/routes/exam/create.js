'use strict' 

const { ROLE } = require('@config/user')
const { CRITERION, EXAM_TYPE } = require('@config/exam')
const moemnt = require('moment')

module.exports = async (fastify) => { 

  const schema = {}

  fastify.post('/', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ]
  }, async (request) => {
    const { user, body } = request
    const params = mapExamParams(user, body)
    return params
  })
}

const mapExamParams = (user, params) => {
  if (params.itemType == EXAM_TYPE.GENERAL) return generalExamType(user, params)
}

const generalExamType = (user, params) => {
  const params = {
    RequestedName: composeRequestName(user),
    RequestType: getRequestType(user),
    RequestedNo: `${composeRequestName(user)}FixedRandomTestset${getRequestType(user)}${moemnt.defaultFormat('YYYYMMDDHHmmSSS')}`,
    TestSetType: getTestSetType(params.quantity),
    ItemType: EXAM_TYPE.GENERAL,
    KeyStage: params.learningArea,
    NoItems: params.quantity,
    ComplexityLevel: params.level
  }

  Object.assign(params, mapCriterion(params))

  return params
}

const composeRequestName = (user) => `${ures.firstName} ${user.lastName}`

const getRequestType = (user) => user.role == ROLE.STUDENT ? 2 : 1

const getTestSetType = (quantity) => quantity > 1 ? 'RI' : 'FI'

const mapCriterion = (params) => {
  switch (params.criterion) {
    case CRITERION.INDICATOR:
      return {
        FollowIndicator: true,
        Indicator: params.indicators.map(indicator => `${indicator.code},${indicator.questionType},${indicator.quantity}`).join(';')
      }
    case CRITERION.STRAND:
      return {
        FollowStrand: true,
        Strand: params.strands.map(strand => `${strand.code},${strand.questionType},${strand.quantity}`).join(';')
      }
    default:
  }
}
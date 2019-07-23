'use strict' 

const { ROLE } = require('@config/user')
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
  if (params.itemType == 'G') return generalExamType(user, params)
}

const generalExamType = (user, params) => {
  const RequestedName = composeRequestName(user)
  const RequestType = getRequestType(user)
  const RequestedNo = `${RequestedName}FixedRandomTestset${RequestType}${moemnt.defaultFormat('YYYYMMDDHHmmSSS')}`
  const TestSetType = params.quantity > 1 ? 'RI' : 'FI'
  return {
    RequestedName,
    RequestType,
    RequestedNo,
    TestSetType
  }
}

const composeRequestName = (user) => `${ures.firstName} ${user.lastName}`

const getRequestType = (user) => user.role == ROLE.STUDENT ? 2 : 1
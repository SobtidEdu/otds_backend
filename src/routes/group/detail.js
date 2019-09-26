'use strict'

const { STUDENT_STATUS } = require('@config/group')

module.exports = async (fastify, options) => {

  const schema = {}

  fastify.get('/:id', {
    preValidation: [
      (request) => fastify.validate(schema.create, request),
      fastify.authenticate()
    ]
  }, async (request) => {
    const { user, params } = request

    const group = await fastify.mongoose.Group.findOne({ _id: params.id })

    const myGroup = user.groups.toObject().find(myGroup => myGroup.info.toString() === group._id.toString())

    const groupDetail = {
      logo: fastify.storage.getUrlGroupLogo(group.logo),
      name: group.name,
      code: group.code,
      studentCount: group.students.filter(student => student.status === STUDENT_STATUS.JOIN).length,
      createdAt: group.createdAt,
      status: myGroup ? myGroup.status : 'none'
    }

    return groupDetail
  })
}
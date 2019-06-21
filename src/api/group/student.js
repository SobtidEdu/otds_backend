'use strict'
// const schema = require('./group.schema')
const uuid = require('uuid')

module.exports = async (fastify, options) => {
  const { ROLE, USERGROUP_STAUS } = fastify.config

  /**
   * Get list's requestor
   */
  fastify.get('/:groupId/students/request', {
    preValidation: [
      // (request) => fastify.validate(schema.list, request),
      fastify.authenticate,
      fastify.authorize([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN])
    ]
  }, async (request) => {

    const { params } = request;

    const group = await fastify.mongoose.Group.findOne({ _id: params.groupId }).populate({path: 'students.requestToJoin.userInfo', model: fastify.mongoose.User, select: 'prefixName firstName lastName school profileImage' })
    if (!group) throw  fastify.httpErrors.notFound(fastify.message('group.notFound'))
    
    const { requestToJoin } = group.students
    return requestToJoin
  })

  /**
   * Get list's student in group
   */
  fastify.get('/:groupId/students/join', {
    preValidation: [
      // (request) => fastify.validate(schema.list, request),
      fastify.authenticate,
      fastify.authorize([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN])
    ]
  }, async (request) => {

    const { params } = request;

    const group = await fastify.mongoose.Group.findOne({ _id: params.groupId }).populate({path: 'students.inGroup.userInfo', model: fastify.mongoose.User, select: 'prefixName firstName lastName school profileImage' })
    if (!group) throw  fastify.httpErrors.notFound(fastify.message('group.notFound'))
    
    const { inGroup } = group.students
    return inGroup
  })

  /**
   * Student request to join group
   */
  fastify.patch('/:groupId/students/request', {
    preValidation: [
      // (request) => fastify.validate(schema.list, request),
      fastify.authenticate,
      fastify.authorize([ROLE.STUDENT])
    ]
  }, async (request) => {
    const { user, params } = request

    const group = await fastify.mongoose.Group.findOne({ _id: params.groupId }).select('students')
    if (!group) throw  fastify.httpErrors.notFound(fastify.message('group.notFound'))

    const { requestToJoin, inGroup } = group.students
    
    if (inGroup.findIndex(student => student.userInfo.toString() === user._id.toString()) !== -1) {
      throw fastify.httpErrors.badRequest(fastify.message('group.already_in_group'))
    }

    if (requestToJoin.findIndex(student => student.userInfo.toString() === user._id.toString()) === -1) {
      const requestor = { userInfo: user._id }
      
      await Promise.all([
        fastify.mongoose.Group.updateOne({_id: group._id}, { $push: { 'students.requestToJoin' : requestor } }),
        fastify.mongoose.User.updateOne({ _id: user._id }, { $push: { groups : { info: group._id, status: USERGROUP_STAUS.REQUEST } } })
      ])
    }
    
    return { message: fastify.message('group.requested_to_join') }
  })

  /**
   * Student cancel joining group
   */
  fastify.patch('/:groupId/students/cancel', {
    preValidation: [
      // (request) => fastify.validate(schema.list, request),
      fastify.authenticate,
      fastify.authorize([ROLE.STUDENT])
    ]
  }, async (request, reply) => {
    const { user, params } = request

    const group = await fastify.mongoose.Group.findOne({ _id: params.groupId }).select('students')
    if (!group) throw  fastify.httpErrors.notFound(fastify.message('group.notFound'))

    const { requestToJoin, inGroup } = group.students

    if (inGroup.findIndex(student => student.userInfo.toString() === user._id.toString()) !== -1) {
      throw fastify.httpErrors.badRequest(fastify.message('group.already_in_group'))
    }

    if (requestToJoin.findIndex(student => student.userInfo.toString() === user._id.toString()) === -1) {
      throw fastify.httpErrors.badRequest(fastify.message('group.did_not_request'))
    }

    const requestor = { userInfo: user._id }
    await Promise.all([
      fastify.mongoose.Group.updateOne({_id: group._id}, { $pull: { 'students.requestToJoin' : requestor } }),
      fastify.mongoose.User.updateOne({ _id: user._id }, { $pull: { groups : { info: group._id } } })
    ])

    return { message: fastify.message('group.cancelled_request') }
  })

  /**
   * Teacher approve student to join
   */
  fastify.patch('/:groupId/students/approve', {
    preValidation: [
      // (request) => fastify.validate(schema.list, request),
      fastify.authenticate,
      fastify.authorize([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN])
    ]
  }, async (request, reply) => {
    const { params, body } = request

    const { studentIds } = body

    const group = await fastify.mongoose.Group.findOne({ _id: params.groupId }).select('students')
    if (!group) throw  fastify.httpErrors.notFound(fastify.message('group.notFound'))

    const { requestToJoin, inGroup } = group.students

    if (inGroup.filter(student => studentIds.includes(student.userInfo.toString())).length > 0) {
      throw fastify.httpErrors.badRequest('มีจำนวนนักเรียนอย่างน้อย 1 คนอยู่ในระบบแล้ว')
    }

    if (requestToJoin.filter(student => !studentIds.includes(student.userInfo.toString())).length > 0) {
      throw fastify.httpErrors.badRequest('มีจำนวนนักเรียนอย่างน้อย 1 คนยังไม่ได้ทำการขอเข้าร่วม')
    }
    
    const requestors = studentIds.map(student => ({ userInfo: student }))

    await Promise.all([
      fastify.mongoose.Group.updateMany({_id: group._id}, { $pull: { 'students.requestToJoin': { $in: { requestors } } } }),
      fastify.mongoose.Group.updateMany({_id: group._id}, { $push: { 'students.inGroup': requestors } }),
      fastify.mongoose.User.updateMany({ _id: { $in: studentIds } }, { $set: { 'groups.$.status': USERGROUP_STAUS.JOIN } } )
    ])

    return { message: fastify.message('group.approval') }
  })

  /**
   * Teacher reject student to join
   */
  fastify.patch('/:groupId/students/reject', {
    preValidation: [
      // (request) => fastify.validate(schema.list, request),
      fastify.authenticate,
      fastify.authorize([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.ADMIN])
    ]
  }, async (request, reply) => {

    const { params, body } = request

    const { studentIds } = body

    const group = await fastify.mongoose.Group.findOne({ _id: params.groupId }).select('students')
    if (!group) throw  fastify.httpErrors.notFound(fastify.message('group.notFound'))

    const { requestToJoin, inGroup } = group.students

    if (inGroup.filter(student => studentIds.includes(student.userInfo.toString())).length > 0) {
      throw fastify.httpErrors.badRequest('มีจำนวนนักเรียนอย่างน้อย 1 คนอยู่ในระบบแล้ว')
    }

    if (requestToJoin.filter(student => !studentIds.includes(student.userInfo.toString())).length > 0) {
      throw fastify.httpErrors.badRequest('มีจำนวนนักเรียนอย่างน้อย 1 คนยังไม่ได้ทำการขอเข้าร่วม')
    }

    const requestors = studentIds.map(student => ({ userInfo: student }))

    await Promise.all([
      fastify.mongoose.Group.updateMany({_id: group._id}, { $pull: { 'students.requestToJoin' : { $in: { requestors } } } }),
      fastify.mongoose.User.updateMany({ _id: { $in: studentIds } }, { $pull: { groups : { info: group._id } } })
    ])

    return { message: fastify.message('group.rejected') }
  })

  /**
   * Student leave the group
   */
  fastify.patch('/:groupId/students/leave', {
    preValidation: [
      // (request) => fastify.validate(schema.list, request),
      fastify.authenticate,
      fastify.authorize([ROLE.STUDENT])
    ]
  }, async (request, reply) => {
    const { user, params } = request

    const group = await fastify.mongoose.Group.findOne({ _id: params.groupId }).select('students')
    if (!group) throw  fastify.httpErrors.notFound(fastify.message('group.notFound'))

    const { inGroup } = group.students

    if (inGroup.findIndex(student => student.userInfo.toString() === user._id.toString()) === -1) {
      throw fastify.httpErrors.badRequest(fastify.message('group.did_not_in_group'))
    }

    const requestor = { userInfo: user._id }

    await Promise.all([
      fastify.mongoose.Group.updateOne({_id: group._id}, { $pull: { 'students.inGroup': requestor } }),
      fastify.mongoose.Group.updateOne({_id: group._id}, { $push: { 'students.hasLeft': requestor } }),
      fastify.mongoose.User.updateOne({_id: user._id}, { $pull: { groups: { info: group._id } } })
    ])

    return { message: fastify.message('group.left') }
  })
}
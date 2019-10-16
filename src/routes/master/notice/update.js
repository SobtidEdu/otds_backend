'use strict'

const { TEMPLATE_HTML_PATH } = require('@config/storage')
const { ROLE } = require('@config/user')
const fs = require('fs')

module.exports = async (fastify, options) => {
  const schema = {}

  fastify.patch('/:noticeId',
  {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN ])
    ]
  }, async (request) => {
    const { body, params } = request


    await fastify.mongoose.Notification.updateOne({ type: 'NOTICE', id: params.noticeId }, { 
      $set: {
        'data.$.text': body.text,
        'data.$.times': body.times,
        'data.$.isBroadcast': body.isBroadcast
      }
    })
    if (body.isBroadcast) {
      await Promise.all([
        fastify.mongoose.User.updateMany({ role: { $in: [ROLE.STUDENT, ROLE.TEACHER, ROLE.SUPER_TEACHER] }}, { 
          $pull: { notices: { id: params.noticeId } } 
        }),
        fastify.mongoose.User.updateMany({ role: { $in: [ROLE.STUDENT, ROLE.TEACHER, ROLE.SUPER_TEACHER] }}, { 
          $push: { notices: { ...body, id: params.noticeId } } 
        })
      ])
      
    } else {
      await fastify.mongoose.User.updateMany({}, {
        $pull: { notices: { id: params.noticeId } } 
      })
    }
    return { message: 'บันทึกข้อมูลการประกาศสำเร็จ' }
  })
}
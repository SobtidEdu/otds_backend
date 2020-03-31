'use strict' 

const { ROLE } = require('@config/user')
const bcrypt = require('bcrypt')
const moment = require('moment')

module.exports = async (fastify, opts) => { 
  fastify.patch('/seen-notice', {
    preValidation: [
      fastify.authenticate([ROLE.TEACHER, ROLE.SUPER_TEACHER, ROLE.STUDENT])
    ]
  }, async (request) => {
    const { user, body } = request

    const index = user.notices.findIndex(notice => notice.id == body.noticeId)
    
    if (user.notices[index].times > 1) {
      user.notices[index].times--
    } else {
      user.notices.splice(index, 1)
    }
    
    await fastify.mongoose.User.updateOne({ _id: user._id }, { $set: { notices: user.notices }})

    return { message: 'success' }
  })
}
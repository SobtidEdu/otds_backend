'use strict' 

const { ROLE } = require('@config/user')

module.exports = async (fastify, opts) => { 
  if (await fastify.mongoose.Contact.countDocuments() == 0) {
    const initialContact = require('./initial.json');
    await fastify.mongoose.Contact.create(initialContact)  
  }

  fastify.get('/', async (request) => {
    return await fastify.mongoose.Contact.findOne()
  })

  fastify.patch('/', {
    preValidation: [
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN ])
    ]
  }, async (request) => {
    const { body } = request

    const contact = await fastify.mongoose.Contact.findOne()
    
    contact.name = body.name
    contact.email = body.email
    contact.tel = body.tel
    contact.address = body.address

    return await contact.save()
  })
}

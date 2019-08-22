'use strict'

const { ROLE } = require('@root/config')
const generator = require('rand-token').generator({ chars: '0-9' })

module.exports = async (fastify, options) => {

  const schema = {
    body: {
      validation: {
        $async: true,
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 3,
            maxLength: 120
          },
          logo: {
            type: 'string',
            contentEncoding: "base64",
            contentMediaType: "image/png"
          }
        },
        required: ['name'],
      },
      message: {
        name: {
          required: 'กรุณากรอกชื่อกลุ่ม',
          minLength: 'กรุณากรอกตัวอักษรมากกว่า 5 และไม่เกิน 120 ตัวอักษร'
        }
      }
    }
  }

  fastify.post('/', {
    preValidation: [
      (request) => fastify.validate(schema.create, request),
      fastify.authenticate(),
      fastify.authorize([ROLE.TEACHER])
    ],
    bodyLimit: 2200000 // limit 2.2 mb
  }, async (request, reply) => {
    const { user, body } = request

    const code = fastify.utils.randonCharacters(2).toUpperCase() + generator.generate(5)

    let group = new fastify.mongoose.Group({ owner: user._id, name: body.name, code })

    if (body.logo) {
      const filename = `group-${group._id}`
      const imageInfo = fastify.storage.diskGroupLogo(body.logo, filename)
      
      group.logo = imageInfo.fileName
    }

    await Promise.all([
      group.save(),
      fastify.mongoose.User.update(
        { _id: user._id },
        { $push: { groups: { info: group, status: 'owner' } } }
      )
    ])

    return reply.status(201).send({
      message: fastify.message('group.created'),
      group
    })
  })
}
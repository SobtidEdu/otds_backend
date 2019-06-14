const fp = require('fastify-plugin')

module.exports = fp( async (fastify, options) => {
  
  const defaultLang = 'th'
  
  fastify.decorate('message', (_path, params = []) => {
    const path = _path.split('.')
    const template = require(`../i18n/${defaultLang}/${path.shift()}`);
    let message = template;

    path.forEach((value) => {
      message = message[value]
    })

    return message
  })
})
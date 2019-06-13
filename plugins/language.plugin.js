const fp = require('fastify-plugin')

module.exports = fp( async (fastify, options) => {
  
  const defaultLang = 'th'
  
  fastify.decorate('lang', (path, params = []) => {
    const path = path.split('.')
    const template = require(`../i18n/${defaultLang}/${path.pop()}`);
    let message = template;

    path.forEach((value) => {
      message = message[value]
    })

    return message
  })
})
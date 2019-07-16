const fp = require('fastify-plugin')
const mustache   = require('mustache');
const fs = require('fs');
const path = require('path');
const { TEMPLATE_HTML_PATH } = require('@config/storage')

module.exports = fp( async (fastify, options) => {
  fastify.decorate('htmlTemplate', {
    getConfirmationRegisterTemplate: async (register) => {
      const filePath = path.resolve(__dirname, '../../', 'storage/html/register-confirmation.html')
      const content = fs.readFileSync(filePath, { encoding: 'utf-8' })
      
      let altSignOptions = Object.assign({
        subject: 'register-confirmation'
      }, fastify.jwt.options.sign)
      
      const token = await fastify.jwt.sign({ email: register.email }, altSignOptions)
      const link = `${fastify.env.APP_FRONTEND_URL}/pathTo/${token}`
      const params = {
        prefixName: register.prefixName,
        firstName: register.firstName,
        lastName: register.lastName,
        link
      }
      return mustache.render(content, params)
    }
  })
})
'use strict'

module.exports = async (fastity, opts) => {
  fastity.register(require('./start'))
  fastity.register(require('./answer'))
  fastity.register(require('./mark'))
  fastity.register(require('./finish'))
}
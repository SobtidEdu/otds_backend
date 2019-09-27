'use strict'

module.exports = async (fastity, opts) => {
  fastity.register(require('./start'))
  fastity.register(require('./solution'))
  fastity.register(require('./answer'))
  fastity.register(require('./mark'))
  fastity.register(require('./finish'))
  fastity.register(require('./result'))
}
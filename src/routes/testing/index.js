'use strict'

module.exports = async (fastity, opts) => {
  fastity.register(require('./start'))
  fastity.register(require('./answer'))
}
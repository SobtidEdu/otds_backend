const fp = require('fastify-plugin')

module.exports = fp( async (fastify, options) => {
  fastify.decorate('utils', {
    randomString: () => {
      return Math.random().toString(36).substring(2)
    },

    capitalize: (string) => {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },

    getExtensionImage: (base64Data) => {
      const index = base64Data.indexOf(';')
      return base64Data.substring(0, index).replace('data:image/', '')
    },
    
    randonCharacters: (length = 1) => {
      var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
      var randomstring = '';
      for (var i=0; i<length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum,rnum+1);
      }
      return randomstring;
    }
  })
})
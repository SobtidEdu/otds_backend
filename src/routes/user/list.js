'use strict' 

const { ROLE } = require('@config/user')

module.exports = async (fastify, opts) => { 
  const schema = {}
  fastify.get('/', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate(),
      fastify.authorize([ ROLE.ADMIN ])
    ]
  }, async (request) => {
    const { query } = request
    
    let baseOptions = [
      {
        $project: { 
          _id: 1,
          profileImage: 1,
          name: { $concat: [ "$prefixName", " ", "$firstName", " ", "$lastName" ] },
          "school.name": 1,
          createdAt: 1,
          lastLoggedInAt: 1,
          email: 1,
          status: 1,
          isBanned: 1,
          isConfirmationEmail: 1,
          isSeenModified: 1,
          privacyPolicy: 1,
          role: 1,
        }
      }
    ]

    if (query.searchKeyword && !query.searchKeyword == '') {
      baseOptions.unshift({
        $match: {
          $or: [
            { firstName: new RegExp(`^${query.searchKeyword}`, 'i') },
            { lastName: new RegExp(`^${query.searchKeyword}`, 'i') },
            { 'school.name.text': new RegExp(`^${query.searchKeyword}`, 'i') }
          ]
        }
      })
    }

    const results = await fastify.paginate(fastify.mongoose.User, query, baseOptions)

    results.items.map(item => Object.assign(item, {
      profileImage: fastify.storage.getUrlProfileImage(item.profileImage)
    }))
    
    return results
  })
}

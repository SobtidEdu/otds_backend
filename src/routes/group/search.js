'use strict'

module.exports = async (fastify, options) => {

  const schema = {}

  fastify.get('/search', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ]
  }, async (request) => {

    const { query } = request;

    if (!query.q) return []

    let baseAggregateOptions = [
      {
        $match: {
          $or: [
            { name: new RegExp('^'+query.q, 'i') },
            { code: new RegExp('^'+query.q, 'i') },
            // { 'onwer.firstName': new RegExp(query.q, 'i') },
            // { 'onwer.lastName': new RegExp(query.q, 'i') }
          ]
        },
      },
      { 
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner'
        }
      },
      { $unwind: "$owner" },
      {
        $project: { 
          _id: 1,
          name: 1,
          code: 1,
          logo: 1,
          ownerName: { $concat: [ "$owner.firstName", " ", "$owner.lastName"] }, 
          createdAt: 1
        }
      }
    ]

    const searchedGroup = fastify.paginate(fastify.mongoose.Group, query, baseAggregateOptions)
    searchedGroup.items = searchedGroup.items.map(group => {
      group.logo = fastify.storage.getUrlGroupLogo(group)
      return group
    })

    return searchedGroup
  })
}
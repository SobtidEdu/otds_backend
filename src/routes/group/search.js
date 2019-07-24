'use strict'

module.exports = async (fastify, options) => {

  const schema = {}

  fastify.get('/search', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ]
  }, async (request) => {

    const { user, query } = request;

    if (!query.q) return []

    const myGroupIdArray = Array.from(user.groups.map(group => group.info))

    let baseAggregateOptions = [
      {
        $match: {
          $or: [
            { name: new RegExp('^'+query.q, 'i') },
            { code: new RegExp('^'+query.q, 'i') },
            // { 'onwer.firstName': new RegExp(query.q, 'i') },
            // { 'onwer.lastName': new RegExp(query.q, 'i') }
          ],
          $and: [
            { _id: { $nin: myGroupIdArray } }
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

    const searchedGroup = await fastify.paginate(fastify.mongoose.Group, query, baseAggregateOptions)

    searchedGroup.items = searchedGroup.items
    .map(group => {
      group.logo = fastify.storage.getUrlGroupLogo(group.logo)
      return group
    })

    return searchedGroup
  })
}
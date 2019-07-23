'use strict'

const { ROLE } = require('@root/config')

module.exports = async (fastify, options) => {

  const schema = {
    query: {
      validation: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            minimum: 1
          },
          limit: { 
            type: 'integer',
            enum: [10, 25, 50, 100]
          },
          sort: {
            type: 'object',
            properties: {
              name: { type: 'string', enum: ['asc', 'desc'] },
              isActived: { type: 'string', enum: ['asc', 'desc'] },
              createdAt: { type: 'string', enum: ['asc', 'desc'] },
              updatedAt: { type: 'string', enum: ['asc', 'desc'] }
            }
          },
          filters: {
            properties: {
              name: { type: 'string' }
            }
          }
        }
      },
      message: {
        page: {
          format: 'page ต้องเป็นตัวเลขจำนวนเต็มบวกและมีค่าตั้งแต่ 1 ขึ้นไป'
        },
        limit: 'limit ต้องเป็นตัวเลขจำนวนเต็มบวกและมีค่าได้แค่ 10, 25, 50 หรือ 100 เท่านั้น',
        sort: 'sort ต้องเป็นประเภท Object เท่านั้น และ Property ควรจะเป็น 1 ในฟิล์ดของข้อมูล มีค่าเป็นได้แค่ asc หรือ desc',
        filters: 'sort ต้องเป็นประเภท Object เท่านั้น และ Property ควรจะเป็น 1 ในฟิล์ดของข้อมูล',
      }
    }
  }

  fastify.get('/', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ]
  }, async (request, reply) => {

    const { user, query } = request;

    if (user.role === ROLE.STUDENT) {
      const baseOptions = [
        { $match: { 'students.inGroup.userInfo': user._id   } },
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
      const results = await fastify.paginate(fastify.mongoose.Group, query, baseOptions)
      return results

    } else {
      const baseOptions = [
        { $match: { owner: user._id} },
        {
          $project: { 
            _id: 1,
            name: 1,
            code: 1,
            owner: 1,
            studentCount: { $size: "$students.inGroup" },
            logo: 1,
            createdAt: 1
          }
        }
      ]

      const groups = await fastify.paginate(fastify.mongoose.Group, query, baseOptions)
      groups.items =  groups.items.map((group) => {
        group.logo = fastify.storage.getUrlGroupLogo(group.logo)
        return group
      })

      return groups
    }
  })
}
'use strict'

const { ROLE } = require('@config/user')
const { STUDENT_STATUS } = require('@config/group')

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
        { 
          $match: { 
            'students': {
              $elemMatch: { 
                userInfo: user._id,
                status: { 
                  $in: [ STUDENT_STATUS.REQUEST, STUDENT_STATUS.JOIN, STUDENT_STATUS.REJECT, STUDENT_STATUS.DISMISS ] 
                }
              }
            }
          }
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
            owner: {
              prefixName: 1,
              firstName: 1,
              lastName: 1,
              role: 1,
            },
            'students.status': 1,
            'students.jointDate': 1,
            createdAt: 1
          }
        }
      ]

      const groups = await fastify.paginate(fastify.mongoose.Group, query, baseOptions)
      // return groups
      groups.items = groups.items.map((group) => ({
        _id: group._id,
        logo: fastify.storage.getUrlGroupLogo(group.logo),
        createdAt: group.createdAt,
        name: group.name,
        code: group.code,
        status: group.students[0].status,
        jointDate: group.students[0].jointDate,
        owner: group.owner
      }))

      return groups 
    } else if (user.role === ROLE.ADMIN) {

      let baseOptions = [
        { 
          $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'owner'
          }
        },
        {
          $unwind: '$owner'
        },
        {
          $project: { 
            _id: 1,
            name: 1,
            code: 1,
            owner: {
              prefixName: 1,
              firstName: 1,
              lastName: 1,
              role: 1,
            },
            'students.status': 1,
            logo: 1,
            createdAt: 1,
            examCount: { $size: '$exams' }
          }
        }
      ]
      
      const groups = await fastify.paginate(fastify.mongoose.Group, query, baseOptions)
      
      groups.items =  groups.items.map((group) => {
        group.logo = fastify.storage.getUrlGroupLogo(group.logo)
        group.studentCount = group.students.reduce((total, student) => total + (student.status === 'join' ? 1 : 0), 0)
        group.haveStudentRequest = group.students.find((student) => student.status === 'request') ? true : false
        delete group.students
        return group
      })

      return groups
    } else {
      let baseOptions = [
        { 
          $match: { owner: user._id} 
        },
        {
          $project: { 
            _id: 1,
            name: 1,
            code: 1,
            'students.status': 1,
            logo: 1,
            createdAt: 1,
          }
        }
      ]
      
      const groups = await fastify.paginate(fastify.mongoose.Group, query, baseOptions)
      
      groups.items =  groups.items.map((group) => {
        group.logo = fastify.storage.getUrlGroupLogo(group.logo)
        group.studentCount = group.students.reduce((total, student) => total + (student.status === 'join' ? 1 : 0), 0)
        group.haveStudentRequest = group.students.find((student) => student.status === 'request') ? true : false
        delete group.students
        return group
      })

      return groups
    }
  })
}
module.exports = {
  list: {
    querystring: {
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
            name: {
              type: 'object'
            },
            abbr: { type: 'string', enum: ['asc', 'desc'] },
            isActive: { type: 'string', enum: ['asc', 'desc'] },
            createdAt: { type: 'string', enum: ['asc', 'desc'] },
            updatedAt: { type: 'string', enum: ['asc', 'desc'] }
          }
        },
        filters: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            isActived: { type: 'boolean' }
          }
        }
      },
      errorMessage: {
        properties: {
          page: 'page ต้องเป็นตัวเลขจำนวนเต็มบวกและมีค่าตั้งแต่ 1 ขึ้นไป',
          limit: 'limit ต้องเป็นตัวเลขจำนวนเต็มบวกและมีค่าได้แค่ 10, 25, 50 หรือ 100 เท่านั้น',
          sort: 'sort ต้องเป็นประเภท Object เท่านั้น และ Property ควรจะเป็น 1 ในฟิล์ดของข้อมูล มีค่าเป็นได้แค่ asc หรือ desc',
          filters: 'sort ต้องเป็นประเภท Object เท่านั้น และ Property ควรจะเป็น 1 ในฟิล์ดของข้อมูล',
        }
      }
    }
  },
  create: {
    body: {
      type: 'object',
      properties: {
        name: {
          type: 'object',
          properties: {
            th: { type: 'string' },
            en: { type: 'string' }
          },
          required: ['th', 'en']
        },
        abbr: { type: 'string',  minLength: 2, maxLength: 2 },
        isActive: { type: 'boolean' }
      },
      required: ['name', 'abbr'],
      errorMessage: {
        required: {
          name: 'กรุณากรอกชื่อประเทศทั้งไทยและอังกฤษ',
          abbr: 'กรุณากรอกตัวย่อของประเทศ'
        },
        properties: {
          name: 'กรุณากรอกชื่อประเทศ',
          isActive: 'isActive ต้องเป็นประเภท Boolean เท่านั้น'
        }
      }
    }
  },
  update: {

  },
  delete: {

  },
  import: {

  }
}
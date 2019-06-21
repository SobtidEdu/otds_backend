module.exports = {
  list: {
    querystring: {
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
            type: 'object',
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
  },
  create: {
    body: {
      validation: {
        $async: true,
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 3,
            maxLength: 120
          },
          logo: {
            type: 'string',
            contentEncoding: "base64",
            contentMediaType: "image/png"
          }
        },
        required: ['name'],
      },
      message: {
        name: {
          required: 'กรุณากรอกชื่อกลุ่ม',
          minLength: 'กรุณากรอกตัวอักษรมากกว่า 5 และไม่เกิน 120 ตัวอักษร'
        }
      }
    }
  },
  update: {

  },
  delete: {

  },
  import: {
    // body: {
    //   type: 'object',
    //   properties: {
    //     file
    //   }
    // }
  }
}
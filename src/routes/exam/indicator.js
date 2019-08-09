'use strict' 

const moemnt = require('moment')

module.exports = async (fastify) => { 

  const schema = {}

  fastify.get('/indicators', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ]
  }, async (request) => {
    const { user, query } = request
    return [
      {
        "code": '60 ค 1.1 ป.1/1',
        "name": "บอกจำนวนของสิ่งต่าง ๆ แสดงสิ่งต่าง ๆ ตามจำนวนที่กำหนดอ่านและเขียนตัวเลขฮินดูอารบิก ตัวเลขไทยแสดงจำนวนนับไม่เกิน 100 และ 0",
        "noitems": 10
      },
      {
        "code": '60 ค 1.1 ป.1/2',
        "name": "เปรียบเทียบจำนวนนับไม่เกิน 100 และ 0 โดยใช้เครื่องหมาย = ≠ > <",
        "noitems": 2
      },
      {
        "code": '60 ค 1.1 ป.1/3',
        "name": "หาค่าของตัวไม่ทราบค่าในประโยคสัญลักษณ์แสดงการบวกและประโยคสัญลักษณ์แสดงการลบของจำนวนนับไม่เกิน 100 และ 0",
        "noitems": 3
      },
      {
        "code": '60 ค 1.1 ป.1/5',
        "name": "แสดงวิธีหาคำตอบของโจทย์ปัญหาการบวก และโจทย์ปัญหาการลบของจำนวนนับไม่เกิน 100 และ 0",
        "noitems": 9
      }
    ]
  })
}
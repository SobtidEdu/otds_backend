'use strict' 

const moemnt = require('moment')

module.exports = async (fastify) => { 

  const schema = {}

  fastify.get('/lessons', {
    preValidation: [
      (request) => fastify.validate(schema, request),
      fastify.authenticate()
    ]
  }, async (request) => {
    const { user, query } = request
    return [
      {
          "code": 1,
          "name": "จำนวนนับ 1 ถึง 10 และ 0",
          "noitems": 1
      },
      {
          "code": 2,
          "name": "การบวกจำนวนสองจำนวนที่ผลบวกไม่เกิน 10",
          "noitems": 1
      },
      {
          "code": 3,
          "name": "การลบจำนวนสองจำนวนที่ตัวตั้งไม่เกิน 10",
          "noitems": 1
      },
      {
          "code": 4,
          "name": "การลบจำนวนสองจำนวนที่ตัวตั้งไม่เกิน 10",
          "noitems": 1
      }
    ]
    // const response = await fastify.otimsApi.getLesson(query)
    // return response
  })
}
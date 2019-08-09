const fp = require('fastify-plugin')
const querystring = require('querystring');
const axios = require('axios')

module.exports = fp(async (fastify, options) => {
  const { OTIMS_API_URL, OTIMS_TOKEN } = fastify.env

  const instance = axios.create({
    baseURL: OTIMS_API_URL,
    timeout: 1000,
    headers: {'Authorization': OTIMS_TOKEN}
  });
  
  fastify.decorate('otimsApi', {
    getLesson: async (params = {}) => {
      const q = querystring.stringify(params);
      // return await instance.get(`/ws/master/lesson?${q}`)
      return [
        {
          id: 1,
          name: 'จำนวนนับ 1 ถึง 10 และ 0',
          noitems: 1
        },
        {
          id: 2,
          name: 'การบวกจำนวนสองจำนวนที่ผลบวกไม่เกิน 10',
          noitems: 1
        },
        {
          id: 3,
          name: 'การลบจำนวนสองจำนวนที่ตัวตั้งไม่เกิน 10',
          noitems: 1
        },
        {
          id: 4,
          name: 'การลบจำนวนสองจำนวนที่ตัวตั้งไม่เกิน 10',
          noitems: 1
        }
      ]
    }
  })
})
'use strict'
// const schema = require('./department.schema')
const departmentList = require('./list')
// const csvParser = require('csvtojson')

module.exports = async (fastify, options) => {
  
  if (await fastify.mongoose.Department.countDocuments() == 0) {
    const initialDepartments = require('./initial.json');
    for (let i = 0; i < initialDepartments.length; i++) {
      await fastify.mongoose.Department.create({ ...initialDepartments[i], seq: i+1 })  
    }
  }

  fastify.register(departmentList)
  fastify.register(require('./create'))
  fastify.register(require('./update'))
}
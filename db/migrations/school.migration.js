'use strict'
const moment = require('moment')

module.exports = {
  sync: async (synchronizer) => {
    console.log('Synchonizing school .....')
    synchronizer.setSqlQueryCmd('SELECT * FROM ot_schools')
    synchronizer.setMongoCollection('schools')
    await synchronizer.synchronize(1000, (from, to) => {
      to.id = from.id
      to.name = from.name
      to.isActived = true
      to.createdAt = moment().unix()
      to.updatedAt = moment().unix()
      return to
    })
    console.log('school synchonized .....')
  },
  clear: async (mongodb) => {
    console.log('Clearing school .....')
    
    try {
      await mongodb.collection('schools').drop()
    } catch (err) {
      if (err.code === 26) console.log('There isn\'t the school collection')
      else console.log(err)
    }
    
    console.log('Cleared school .....')
  }
}
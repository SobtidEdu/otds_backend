'use strict'
const moment = require('moment')
const Synchronizer = require('./synchronizer')
const synchronizer = new Synchronizer()

module.exports = {
  sync: async () => {
    console.log('Synchonizing Province .....')
    await synchronizer.connectDB()
    synchronizer.setSqlQueryCmd('SELECT * FROM ot_provinces')
    synchronizer.setMongoCollection('provinces')
    await synchronizer.synchronize(1000, (from, to) => {
      to.id = from.id,
      to.name = from.name
      to.isActived = true
      to.createdAt = moment().unix()
      to.updatedAt = moment().unix()
      return to
    })
    await synchronizer.close()
    console.log('Province synchonized .....')
  },
  clear: async (mongodb) => {
    console.log('Clearing Province .....')
    
    try {
      await mongodb.collection('provinces').drop()
    } catch (err) {
      if (err.code === 26) console.log('There isn\'t the province collection')
      else console.log(err)
    }
    
    console.log('Cleared Province .....')
  }
}
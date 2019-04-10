'use strict'
const moment = require('moment')
const Synchronizer = require('./synchronizer')
const synchronizer = new Synchronizer()

module.exports = {
  sync: async () => {
    console.log('Synchonizing Competition .....')
    await synchronizer.connectDB()
    synchronizer.setSqlQueryCmd('SELECT * FROM ot_competition')
    synchronizer.setMongoCollection('competitions')
    await synchronizer.synchronize(1000, (from, to) => {
      to.name = from.name,
      to.isActived = from.hidden == 0 ? true : false,
      to.createdAt = moment().unix()
      to.updatedAt = moment().unix()
      return to
    })
    await synchronizer.close()
    console.log('Competition synchonized .....')
  },
  clear: async (mongodb) => {
    console.log('Clearing Competition .....')
    
    try {
      await mongodb.collection('competitions').drop()
    } catch (err) {
      if (err.code === 26) console.log('There isn\'t the competition collection')
      else console.log(err)
    }
    
    console.log('Cleared Competition .....')
  }
}
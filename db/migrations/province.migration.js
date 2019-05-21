'use strict'
const moment = require('moment')
const { connectMongodb } = require('./mongo-connection')

module.exports = {
  sync: async (synchronizer) => {
    console.log('Synchonizing Province .....')
    const { mongoConnection, mongodb } = await connectMongodb()
    synchronizer.setSqlQueryCmd('SELECT * FROM ot_provinces')
    synchronizer.setMongoCollection('provinces')
    const th = await mongodb.collection('countries').findOne({abbr: 'TH'})
    await mongoConnection.close()
    await synchronizer.synchronize(1000, (from, to) => {
      to.id = from.id
      to.name = from.name
      to.isActive = true
      to.createdAt = moment().unix()
      to.updatedAt = moment().unix()
      return to
    })
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
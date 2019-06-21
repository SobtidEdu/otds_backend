'use strict'
const moment = require('moment')

module.exports = {
  sync: async (synchronizer) => {
    console.log('Synchonizing school .....')
    synchronizer.setSqlQueryCmd('SELECT * FROM ot_users')
    synchronizer.setMongoCollection('users')
    await synchronizer.synchronize(1000, (from, to) => {
      // console.log(from)
      to.id = from.id
      to.name = from.name
      to.username = from.username
      to.isActived = true
      to.createdAt = moment().unix()
      to.updatedAt = moment().unix()
      return to
    })
    console.log('user synchonized .....')
  },
  clear: async (mongodb) => {
    console.log('Clearing user .....')
    
    try {
      await mongodb.collection('users').drop()
    } catch (err) {
      if (err.code === 26) console.log('There isn\'t the user collection')
      else console.log(err)
    }
    
    console.log('Cleared user .....')
  }
}
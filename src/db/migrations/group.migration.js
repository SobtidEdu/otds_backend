'use strict'
const moment = require('moment')
const { connectMongodb } = require('./mongo-connection')
const generator = require('rand-token').generator({ chars: '0-9' })

const randonCharacters = (length = 1) => {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  var randomstring = '';
  for (var i=0; i<length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum,rnum+1);
  }
  return randomstring;
}

module.exports = {
  sync: async (synchronizer, continueRound) => {
    console.log('Synchonizing group .....')
    const { mongoConnection, mongodb } = await connectMongodb()
    synchronizer.setSqlQueryCmd("SELECT * FROM ot_group")
    synchronizer.setMongoCollection('groups')

    await synchronizer.synchronize(50, continueRound, async (from, to) => {
      const user = await mongodb.collection('users').findOne({ oldSystemId: from.create_by })

      if (!user) {
        return null
      }
      to.name = from.group_name
      to.oldSystemId = from.group_id
      to.code = randonCharacters(2).toUpperCase() + generator.generate(3)
      to.createdAt = moment(from.create_date).unix()
      to.updatedAt = moment().unix()
      to.deletedAt = null
      to.logo = null
      to.students = []
      to.exams = []
      to.owner = user._id
      
      return to
    })
    await mongoConnection.close()
    console.log('group synchonized .....')
  },
  clear: async (mongodb) => {
    console.log('Clearing group .....')
    
    try {
      await mongodb.collection('groups').deleteMany({ oldSystemId: { $exists: true } })
    } catch (err) {
      if (err.code === 26) console.log('There isn\'t the group collection')
      else console.log(err)
    }
    
    console.log('Cleared group .....')
  }
}
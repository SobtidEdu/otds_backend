'use strict'
const moment = require('moment')
const { connectMongodb } = require('./mongo-connection')

module.exports = {
  sync: async (synchronizer) => {
    console.log('Synchonizing user .....')
    const { mongoConnection, mongodb } = await connectMongodb()
    synchronizer.setSqlQueryCmd('SELECT ot_users.*, ot_schools.name as school_name FROM ot_users LEFT JOIN ot_schools ON ot_users.school_id = ot_schools.id')
    synchronizer.setMongoCollection('users')

    await synchronizer.synchronize(1000, async (from, to) => {
      from.name = from.name.split(' ')
      from.school_name = from.school_name ? from.school_name.replace('โรงเรียน', '') : ''
      const school = await mongodb.collection('schools').findOne({ name: from.school_name })
      if (school) {
        to.school = {
          name: {
            text: school.name,
            isModified: false
          },
          addressNo: {
            text: school.addressNo,
            isModified: false
          },
          villageNo: {
            text: school.villageNo,
            isModified: false
          },
          lane: {
            text: school.lane,
            isModified: false
          },
          road: {
            text: school.road,
            isModified: false
          },
          subDistrict: {
            text: school.subDistrict,
            isModified: false
          },
          district: {
            text: school.district,
            isModified: false
          },
          postalCode: {
            text: school.postalCode,
            isModified: false
          },
          department: {
            text: school.department,
            isModified: false
          },
          province: {
            id: school.province,
            isModified: false
          },
        }
      } else {
        to.school = {
          name: {
            text: from.school_name,
            isModified: true
          },
          addressNo: {
            text: '',
            isModified: true
          },
          villageNo: {
            text: '',
            isModified: true
          },
          lane: {
            text: '',
            isModified: true
          },
          road: {
            text: '',
            isModified: true
          },
          subDistrict: {
            text: '',
            isModified: true
          },
          district: {
            text: '',
            isModified: true
          },
          postalCode: {
            text: '',
            isModified: true
          },
          department: {
            text: '',
            isModified: true
          },
          province: {
            id: '',
            isModified: true
          },
        }
      }
      
      to.oldSystemId = parseInt(from.id, 10)
      to.prefixName = 'นาย'
      to.firstName = from.name[0]
      to.lastName = from.name[1] ? from.name[1] : ''
      to.username = from.username.toLowerCase()
      to.email = from.email.toLowerCase()
      to.password = {
        hashed: from.password,
        algo: 'md5'
      }
      to.role = from.role == 3 ? 'admin' : (from.role == 2 ? 'teacher' : 'student')
      to.isComfirmationEmail = true
      to.createdAt = moment().unix()
      to.updatedAt = moment().unix()
      // console.log(to)
      return to
    })
    await mongoConnection.close()
    console.log('user synchonized .....')
  },
  clear: async (mongodb) => {
    console.log('Clearing user .....')
    
    try {
      await mongodb.collection('users').deleteMany({ oldSystemId: { $exists: true } })
    } catch (err) {
      if (err.code === 26) console.log('There isn\'t the user collection')
      else console.log(err)
    }
    
    console.log('Cleared user .....')
  }
}
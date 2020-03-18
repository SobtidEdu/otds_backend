(async () => {
  const { connectMongodb } = require('./mongo-connection')
  const mysql = require('./mysql-connection')
  const moment = require('moment')

  const {mongoConnection, mongodb} = await connectMongodb()

  const oldGroups = await mysql.query(`SELECT * FROM ot_group_member WHERE approved_status = '1' ORDER BY group_id ASC`)
  await mysql.close()
  const length = oldGroups.length

  let user = null
  for (let i=0; i< length; i++) {
    user = await mongodb.collection('users').findOne({ oldSystemId: oldGroups[i].student_id })
    if (user) {
      console.log(`student ${user._id}`)
      await mongodb.collection('groups').updateOne({ oldSystemId: oldGroups[i].group_id }, {
        $push: {
          students: {
            userInfo: user._id,
            status: 'join',
            requestedDate: moment(oldGroups[i].reg_date).unix(),
            jointDate: moment(oldGroups[i].approved_date).unix(),
            leftDate: null,
            teacherSeenLeft: false
          }
        }
      })
    }
  }
  
  await mongoConnection.close()
  process.exit()
})();
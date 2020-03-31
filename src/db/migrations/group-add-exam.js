(async () => {
  const { connectMongodb } = require('./mongo-connection')
  const mysql = require('./mysql-connection')
  const moment = require('moment')

  const {mongoConnection, mongodb} = await connectMongodb()

  const oldGroups = await mysql.query(`SELECT * FROM ot_group_exam_shared ORDER BY group_id ASC`)
  await mysql.close()
  const length = oldGroups.length

  let exam = null
  for (let i=0; i< length; i++) {
    exam = await mongodb.collection('exams').findOne({ oldSystemId: oldGroups[i].exam_id })
    if (exam) {
      console.log(`exam ${exam._id}`)
      await mongodb.collection('groups').updateOne({ oldSystemId: oldGroups[i].group_id }, {
        $push: {
          exams: {
            _id: exam._id,
            status: false,
            addedAt: moment(oldGroups[i].share_date).unix()
          }
        }
      })
    }
  }
  
  await mongoConnection.close()
  process.exit()
})();
(async () => {
  const { connectMongodb } = require('./mongo-connection')
  const mysql = require('./mysql-connection')
  const moment = require('moment')
 
  const {mongoConnection, mongodb} = await connectMongodb()
  const recordsPerRound = 50
  const total = await mysql.query(`SELECT COUNT(*) FROM xml_student_assigned_exam WHERE is_delete = '0' AND user_id != '0' ORDER BY user_id ASC`)
  const round = Math.ceil(total[0]['COUNT(*)'] / recordsPerRound)
  
  for (i = 0; i < round; i++) {
    console.log(`round ${i+1} / ${round}`)
    const assignments = await mysql.query(`SELECT * FROM xml_student_assigned_exam WHERE is_delete = '0' AND user_id != '0' ORDER BY user_id ASC LIMIT ${i*recordsPerRound}, ${recordsPerRound}`)
    console.log(`Total record ${assignments.length}`)
    await assignments.forEach( async (assignment) => {
      const exam = await mongodb.collection('exams').findOne({ oldSystemId: assignment.exam_id })
      if (exam) {
        await mongodb.collection('users').updateOne({ oldSystemId: assignment.exam_id }, {
          $push: {
            myExam: {
              latestAction: moment().unix(),
              examId: exam._id,
              groupId: null
            }
          }
        })
      }
      console.log(`user id ${assignment.user_id} has been add exam ${assignment.exam_id}`)
    })
  }
  await mysql.close()
  await mongoConnection.close()
  process.exit()
})();
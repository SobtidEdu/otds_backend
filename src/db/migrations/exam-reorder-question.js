(async () => {
  try {
    const { connectMongodb } = require('./mongo-connection')
    // const mysql = require('./mysql-connection')
    const moment = require('moment')
  
    const {mongoConnection, mongodb} = await connectMongodb()
    const recordsPerRound = 50
    const total = await mongodb.collection('exams').countDocuments()
    const round = Math.ceil(total / recordsPerRound)
    
    for (i = 0; i < round; i++) {
      console.log(`round ${i+1} / ${round}`)
      if (i+1 < 13) continue
      const exams = await mongodb.collection('exams').aggregate([
        {
          $sort: { createdAt: 1 }
        },
        {
          $skip: i*recordsPerRound
        },
        {
          $limit: recordsPerRound
        }
      ], { allowDiskUse: true }).toArray()
      // console.log()
      for (j = 0; j < exams.length; j++) {
        const exam = exams[j]
        const updateQuestions = exam.questions.map((question, qi) => {
          question.seq = qi+1
          return question
        })
        // console.log(updateQuestions)
        await mongodb.collection('exams').updateOne({ code: exam.code }, { $set: { questions: updateQuestions }})
      }
    }
    // await mysql.close()
    await mongoConnection.close()
    process.exit()
  } catch (e) {
    console.log(`Top-level exception ${e}`)
  }
})();
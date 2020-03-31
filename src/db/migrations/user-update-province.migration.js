(async () => {
  const { connectMongodb } = require('./mongo-connection')
  const mysql = require('./mysql-connection')
  const moment = require('moment')

  const {mongoConnection, mongodb} = await connectMongodb()
  const recordsPerRound = 50
  const total = await mysql.query(`SELECT COUNT(*) FROM ot_users INNER JOIN ot_provinces ON ot_users.province_id = ot_provinces.id ORDER BY ot_users.id ASC`)
  const round = Math.ceil(total[0]['COUNT(*)'] / recordsPerRound)
  const provinces = await mongodb.collection('provinces').find().toArray()

  for (i = 0; i < round; i++) {
    console.log(`round ${i+1} / ${round}`)
    // if (i < 17) continue;
    const users = await mysql.query(`SELECT ot_users.id, ot_provinces.name FROM ot_users INNER JOIN ot_provinces ON ot_users.province_id = ot_provinces.id ORDER BY ot_users.id ASC LIMIT ${i*recordsPerRound}, ${recordsPerRound}`)
    console.log(`Total record ${users.length}`)
    for (j = 0; j < users.length; j++) {
      const province = await provinces.find(prov => prov['name'] === users[j].name)
      if (province) {
        console.log(`user id: ${users[j].id} found province id: ${province._id}`)
        await mongodb.collection('users').updateOne({ oldSystemId: users[j].id }, { $set: {
          "school.province.id": { 
            id: province._id,
            isModified: false
          }
        }})
      }
    }
  }

  await mysql.close()
  await mongoConnection.close()
  process.exit()
})();
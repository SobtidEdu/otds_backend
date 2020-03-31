(async () => {
  const fs = require('fs')
  const axios = require('axios')
  const { connectMongodb } = require('./mongo-connection')
  const mysql = require('./mysql-connection')

  const download_image = (url, image_path) =>
    axios({
      url,
      responseType: 'stream',
    }).then(response =>
      new Promise((resolve, reject) => {
        console.log(url)
        response.data
          .pipe(fs.createWriteStream(image_path))
          .on('finish', () => resolve())
          .on('error', e => reject(e));
      })
    )
  
  const {mongoConnection, mongodb} = await connectMongodb()
  const ONLINE_ETESTING = `http://onlinetesting.ipst.ac.th` 

  const oldGroups = await mysql.query(`SELECT * FROM ot_group WHERE image != '' ORDER BY group_id ASC`)
  await mysql.close()
  const summary = {
    has: 0,
    hasnt: 0
  }
  let i = 1
  console.log(`total ${oldGroups.length}`)
  for (let oldGroup of oldGroups) {
    const fileName = oldGroup.image
    const imageUrl = `${ONLINE_ETESTING}/images/uploads/${encodeURIComponent(fileName)}`
    try {
      await download_image(imageUrl, `storage/images/group/${fileName}`)
      console.log('aleary download')
      await mongodb.collection('groups').updateOne({ oldSystemId: oldGroup.group_id }, { $set: { logo: fileName  } })
      summary.has++
    } catch (e) {
      console.log('User error', oldGroup)
      await mongodb.collection('groups').updateOne({ oldSystemId: oldGroup.group_id }, { $set: { logo: null  } })
      summary.hasnt++
      // process.exit()
    }
    
    console.log(`No. ${i++}`)
  }

  console.log(`User has real profile: ${summary.has} and not have ${summary.hasnt} of ${oldGroups.length} user.`)
  
  await mongoConnection.close()
  process.exit()
})();
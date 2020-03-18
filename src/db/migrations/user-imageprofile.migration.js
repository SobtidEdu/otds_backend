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

  const oldUsers = await mysql.query(`SELECT * FROM ot_users WHERE avatar != '' ORDER BY id ASC`)
  await mysql.close()
  const summary = {
    has: 0,
    hasnt: 0
  }
  let i = 1
  console.log(`total ${oldUsers.length}`)
  for (let oldUser of oldUsers) {
    const matched = oldUser.avatar.match(/images\/.*/i)[0]
    const fileName = matched.split('/').reverse()[0]
    if (['phtml'].includes(fileName.split('.')[1]) === false) {
      const imageUrl = `${ONLINE_ETESTING}/images/uploads/${encodeURIComponent(fileName)}`
      console.log(imageUrl)
      try {
        await download_image(imageUrl, `storage/images/profile/${fileName}`)
        await mongodb.collection('users').updateOne({ oldSystemId: oldUser.id }, { $set: { profileImage: fileName  } })
        summary.has++
      } catch (e) {
        console.log(e)
        console.log('User error', oldUser)
        await mongodb.collection('users').updateOne({ oldSystemId: oldUser.id }, { $set: { profileImage: null  } })
        summary.hasnt++
        // process.exit()
      }
    }
    
    console.log(`No. ${i++}`)
  }

  console.log(`User has real profile: ${summary.has} and not have ${summary.hasnt} of ${oldUsers.length} user.`)
  
  await mongoConnection.close()
  process.exit()
})();
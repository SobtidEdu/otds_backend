require('dotenv').config()
let MongoClient = require('mongodb').MongoClient;

const { DB_HOST, DB_USER, DB_PASSWORD, DB_PORT, DB_NAME } = process.env

const url = process.env.MONGODB_URL

exports.connectMongodb = async () => {
  try {
    const mongoConnection = await MongoClient.connect(url, { useNewUrlParser: true })
    const mongodb = mongoConnection.db(DB_NAME)
    return {mongoConnection, mongodb}
  }
  catch (err) {
    console.log(err)
    mongoConnection.close();
  }
}

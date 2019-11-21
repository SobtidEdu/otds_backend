require('dotenv').config()
let MongoClient = require('mongodb').MongoClient;

const { MONGO_HOST, MONGO_USERNAME, MONGO_PASSWORD, MONGO_PORT, MONGO_DBNAME } = process.env

exports.connectMongodb = async () => {
  try {
    const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DBNAME}`
    const mongoConnection = await MongoClient.connect(url, { useNewUrlParser: true })
    const mongodb = mongoConnection.db(MONGO_DBNAME)
    return {mongoConnection, mongodb}
  }
  catch (err) {
    console.log(err)
    mongoConnection.close();
  }
}

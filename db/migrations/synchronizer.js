const { connectMongodb } = require('./mongo-connection')

class Synchronizer {
  constructor() {
    this.sqlQueryCmd = ''
    this.mongoCollection = ''
    this.mysql
    this.mongodb
    this.mongoConnection
  }

  setSqlQueryCmd(sqlCmd) {
    this.sqlQueryCmd = sqlCmd
  }

  setMongoCollection(collectionName) {
    this.mongoCollection = collectionName
  }

  async connectDB() {
    const {mongoConnection, mongodb} = await connectMongodb()
    this.mongodb = mongodb
    this.mongoConnection = mongoConnection
    this.mysql = require('./mysql-connection')
  }

  async synchronize(recordsPerRound = 1000, callback) {
    const { total } = (await this.mysql.query(`SELECT count(*) AS total FROM (${this.sqlQueryCmd}) AS T`)).shift()
    console.log(`Total Records : ${total}`)
    const round = Math.ceil(total / recordsPerRound)
    let firstRecordInRound = 0
    let lastRecordInRound = 0
    let items = []

    for (let i = 1; i <= round; i++) {
      firstRecordInRound = ((i-1)*recordsPerRound)+1
      lastRecordInRound = i*recordsPerRound < total ? i*recordsPerRound : total
      console.log(`Round ${i}/${round} upstreaming ${recordsPerRound} records each round`)
      console.log(` Quering... ${firstRecordInRound} - ${lastRecordInRound}`)
      const sources = await this.mysql.query(`${this.sqlQueryCmd} LIMIT ${firstRecordInRound - 1}, ${recordsPerRound}`)
      console.log(` Manipulating... ${firstRecordInRound} - ${lastRecordInRound}`)
      for (let j = 0; j < lastRecordInRound; j++) {
        items[j] = callback(sources[j], {})
      }
      console.log(` Inserting... ${firstRecordInRound} - ${lastRecordInRound}`)
      await this.mongodb.collection(this.mongoCollection).insertMany(items)
    }
  }

  async close() {
    await this.mongoConnection.close()
    await this.mysql.close()
  }
}

module.exports = Synchronizer
const { connectMongodb } = require('./mongo-connection')

class Synchronizer {
  constructor() {
    this.sqlQueryCmd = null
    this.mongoCollection = null
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
    if (!this.mongoConnection) {
      this.mongodb = mongodb
      this.mongoConnection = mongoConnection
    }
    if (!this.mysql) {
      this.mysql = require('./mysql-connection')
    }
  }

  async synchronize(recordsPerRound = 1000, continueRound, callback) {
    const { total } = (await this.mysql.query(`SELECT count(*) AS total FROM (${this.sqlQueryCmd}) AS T`)).shift()
    console.log(`Total Records : ${total}`)
    const round = Math.ceil(total / recordsPerRound)
    let firstRecordInRound = 0
    let lastRecordInRound = 0
    let amountRecordInRound = 0
    let items = []
    let temp = {}

    for (let i = 1; i <= round; i++) {
      if (continueRound && i < continueRound) continue;
      items = []
      firstRecordInRound = ((i-1)*recordsPerRound)+1
      lastRecordInRound = i*recordsPerRound < total ? i*recordsPerRound : total
      amountRecordInRound = lastRecordInRound - firstRecordInRound
      console.log(`Round ${i}/${round} upstreaming ${recordsPerRound} records each round`)
      console.log(` Quering... ${firstRecordInRound} - ${lastRecordInRound}`)
      console.log(`${this.sqlQueryCmd} ORDER BY id ASC LIMIT ${firstRecordInRound - 1}, ${recordsPerRound}`)
      const sources = await this.mysql.query(`${this.sqlQueryCmd} ORDER BY create_date ASC LIMIT ${firstRecordInRound - 1}, ${recordsPerRound}`)
      console.log(`${this.sqlQueryCmd} LIMIT ${firstRecordInRound - 1}, ${recordsPerRound}`)
      console.log(` Manipulating... ${firstRecordInRound} - ${lastRecordInRound}`)
      for (let j = 0; j < amountRecordInRound; j++) {
        temp = await callback(sources[j], {})
        if (temp) {
          items.push(temp)
        }
      }
      console.log(` Inserting... ${firstRecordInRound} - ${lastRecordInRound}`)
      if (items.length > 0) {
        await this.mongodb.collection(this.mongoCollection).insertMany(items)
      }
    }
  }

  async close() {
    await this.mongoConnection.close()
    await this.mysql.close()
  }
}

module.exports = Synchronizer
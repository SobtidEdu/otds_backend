'use strict'

require('dotenv').config()
const mysql = require('mysql');

const config = {
  host: process.env.SYNC_DB_HOST,
  user: process.env.SYNC_DB_USERNAME,
  password: process.env.SYNC_DB_PASSWORD,
  port: process.env.SYNC_DB_PORT,
  database: process.env.SYNC_DB_NAME
}

class MySQLConnection {
  constructor() {
    this.connection = mysql.createConnection(config)
    this.connection.connect()
  }

  query(sql, args) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, args, (err, rows) => {
        if (err) {
          console.log(err)
          return reject(err)
        }
        resolve(rows)
      })
    })
  }

  close() {
    return new Promise((resolve, reject) => {
      this.connection.end(err => {
        if (err) return reject(err)
        resolve()
      })
    })
  }
}

const mysqlConnection = new MySQLConnection()

module.exports = mysqlConnection
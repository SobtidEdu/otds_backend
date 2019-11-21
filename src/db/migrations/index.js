#!/usr/bin/env node

const program = require('commander')
const { connectMongodb } = require('./mongo-connection')
const Synchronizer = require('./synchronizer')
const synchronizer = new Synchronizer()
const groupCommands = ['user', 'exam']

program
  .version('1.0.0')
  .command('sync <cmd>')
  .action(async (cmd) => {
    console.log('===== OTDS Migration Getting Start =====')
    await synchronizer.connectDB()
    if (cmd == 'all') {
      for (migration of groupCommands) {
        let migrate = require(`./${migration}.migration`)
      
        await migrate.sync(synchronizer)
      }
    } else {
      if (!groupCommands.includes(cmd)) {
        console.error('No command given!');
        process.exit(1);
      }

      const migrate = require(`./${cmd}.migration`)
      
      await migrate.sync(synchronizer)
    }
    await synchronizer.close()
    console.log('===== OTDS Migration End =====')
  })

program
  .command('clear <cmd>')
  .action(async (cmd) => {
    console.log('===== OTDS Cleaning Data =====')
    if (cmd == 'all') {
      const {mongoConnection, mongodb} = await connectMongodb()
      for (migration of groupCommands) {
        let migrate = require(`./${migration}.migration`)
      
        await migrate.clear(mongodb)
      }
      mongoConnection.close()
    } else {
      if (!groupCommands.includes(cmd)) {
        console.error('No command given!');
        process.exit(1);
      }
      const {mongoConnection, mongodb} = await connectMongodb()
      const migrate = require(`./${cmd}.migration`)
    
      await migrate.clear(mongodb)
      mongoConnection.close()
    }
    
  })

program.parse(process.argv);
const mongoose = require('mongoose');
const Slack = require('slack-node');
const MONGODB_URI = require('./db/mongoPassword').mongoPassword;
const { WebClient } = require('@slack/web-api')
const token = process.env.token
const slackBot = new WebClient(token)

// Connect to MongoDB
mongoose.set('strictQuery', true);
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('MongoDB connected!');

  // Define schema and model
  const deviceSchema = new mongoose.Schema({
    _id: String,
    deviceName: String,
    creationTime: Date,
    saveTime: Date,
    runningTime: Date,
    lastSequence: Number,
    state: String,
    instanceId: Number,
    Device: Object,
  });

  let devices = [
    {
      name: "DVF-5000",
      webhook: 'https://hooks.slack.com/services/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',
      channel: 'C04ND0FHD3Q',
      previousState: "INIT"
    },
    {
      name: "DVF-6500",
      webhook: 'https://hooks.slack.com/services/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',
      channel: 'C04NKJ77XFC',
      previousState: "INIT"
    },
    {
      name: "UNIT-35",
      webhook: 'https://hooks.slack.com/services/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',
      channel: 'C04ND0GGXB8',
      previousState: "INIT"
    },
  ]

  const sendMessage = async (message, channel) => {
    try {
      await slackBot.chat.postMessage({
        channel: channel,
        text: message
      })
    } catch (err) {
      console.log(err.message)
    }
  }

  let previousState = {};
    for(let i = 0; i<devices.length; i++){
      previousState[devices[i].name] = 'INIT'
    }



  devices.forEach(device => {
    const Data = mongoose.model(device.name, deviceSchema);
    

    // Watch the collection for changes
    const changeStream = Data.watch();
    changeStream.on('change', function (change) {
      if (change.operationType === 'insert') {
        // If the state field has changed
        // console.log(`previous State: ${device.previousState}, current State: ${change.fullDocument.state}`)
        if ((device.previousState != change.fullDocument.state) && (device.previousState == 'ACTIVE')) {
          // Send a message to Slack
          console.log(`Send message to ${device.name} ${device.previousState} > ${change.fullDocument.state}`)
          sendMessage(`State changed to: ${change.fullDocument.state} in collection ${device.name}`, device.channel)
        }
        device.previousState = change.fullDocument.state

      }
    })
  })
})
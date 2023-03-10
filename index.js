const mongoose = require('mongoose');
const MONGODB_URI = process.env.mongo_password
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
      channel: 'C04ND0FHD3Q',
      previousState: "INIT",
      cycleTime: 0,
      currentBlock: "#",
      partCount: 0
    },
    {
      name: "DVF-6500",
      channel: 'C04NKJ77XFC',
      previousState: "INIT",
      cycleTime: 0,
      currentBlock: "#",
      partCount: 0
    },
    {
      name: "UNIT-35",
      channel: 'C04ND0GGXB8',
      previousState: "INIT",
      cycleTime: 0,
      currentBlock: "#",
      partCount: 0
    },
    {
      name: "test",
      channel: 'C04T72Y5GF7',
      previousState: "INIT",
      cycleTime: 0,
      currentBlock: "#",
      partCount: 0
    },
  ]

const sendMessage = async (message, blocks, channel) => {
  try {
    await slackBot.chat.postMessage({
      channel: channel,
      text: message,
      blocks: blocks
    })
  } catch (err) {
    console.log(err.message)
  }
}

  const generateMessage = (deviceName, previousState, currentState, partCount, cycleTime, currentBlock) => {
    let message = `[${deviceName}]가 '${previousState}' 상태에서 '${currentState}' 상태로 변경되었습니다.`
    let blocks =  [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": deviceName
                }
            },
            {
                "type": "context",
                "elements": [
                    {
                        "text": `${previousState} :arrow_right: *${currentState}*`,
                        "type": "mrkdwn"
                    }
                ]
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": ":gear: 가공 부품수: `"+partCount+"`"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": ":alarm_clock: 싸이클 타임: `"+cycleTime+"`"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": ":sunflower: 현재 블럭: `"+currentBlock+"`"
                }
            },
            {
                "type": "divider"
            },
        ]
    
    
    return [message, blocks]
}

  const formatTime = (date) => {
  const hours = date.getUTCHours();
  const minutes = date.getMinutes() + hours * 60;
  const seconds = date.getSeconds();
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');
  const formattedTime = `${formattedMinutes}m ${formattedSeconds}s`;
  return formattedTime;
}


  devices.forEach(device => {
    const Data = mongoose.model(device.name, deviceSchema);
    console.log(`Connect with ${device.name} collection`)
    // Watch the collection for changes
    const changeStream = Data.watch();
    changeStream.on('change', function (change) {
      if (change.operationType === 'insert') {
        // If the state field has changed
        // console.log(`insert ${device.name}`)
        if ((device.previousState != change.fullDocument.state) && (device.previousState == 'ACTIVE')) {
          // Send a message to Slack
          console.log(`Send message to ${device.name} ${device.previousState} > ${change.fullDocument.state}`)
          const [message, blocks] = generateMessage(device.name, device.previousState, change.fullDocument.state, change.fullDocument.Device.Components.path.Events.part_count, formatTime(device.cycleTime),change.fullDocument.Device.Components.path.Events.block)
          sendMessage(message, blocks, device.channel)
        }
        device.previousState = change.fullDocument.state
        device.currentBlock = change.fullDocument.Device.Components.path.Events.block
        device.cycleTime = change.fullDocument.runningTime

      }
    })
  })
})
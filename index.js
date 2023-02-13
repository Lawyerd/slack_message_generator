const mongoose = require('mongoose');
const Slack = require('slack-node');
const MONGODB_URI = require('./db/mongoPassword').mongoPassword;

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

  const devices = [
    {
      name: "DVF-5000",
      webhook: 'https://hooks.slack.com/services/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',
      previousState: "INIT"
    },
    {
      name: "DVF-6500",
      webhook: 'https://hooks.slack.com/services/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',
      previousState: "INIT"
    },
    {
      name: "UNIT-35",
      webhook: 'https://hooks.slack.com/services/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',
      previousState: "INIT"
    },
  ]

  devices.forEach(device => {
    const Data = mongoose.model(device.name, deviceSchema);

    // Watch the collection for changes
    const changeStream = Data.watch();
    changeStream.on('change', function (change) {
      if (change.operationType === 'insert') {
        // If the state field has changed
        // console.log('current State: '+change.fullDocument.state)
        if ((device.previousState != change.fullDocument.state) && (device.previousState == 'ACTIVE')) {
          // Send a message to Slack
          const slack = new Slack();
          slack.setWebhook(device.webhook);
          console.log(`previous State: ${device.previousState}, current State: ${change.fullDocument.state}`)
          slack.webhook({
            text: `State changed to: ${change.fullDocument.state} in collection ${device.name}`
          }, function (err, response) {
            console.log(response.status);
          });
        }
        device.previousState = change.fullDocument.state
      }

    });
  });
});
const mongoose = require('mongoose');
const { IncomingWebhook } = require('@slack/webhook');
const MONGODB_URI = require('./db/mongoPassword').mongoPassword;

// Connect to MongoDB
mongoose.set('strictQuery', true);
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
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
  const Data = mongoose.model("dvf-5000", deviceSchema);

  // Watch the collection for changes
  const changeStream = Data.watch();
  changeStream.on('change', change => {
    // If the state field has changed
    if (change.operationType === 'insert') {
      // Send a message to Slack'
      const webhook = new IncomingWebhook('https://hooks.slack.com/services/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');
      webhook.send({
        text: `State changed to: ${change.fullDocument.state}`
      }).then(res => {
        console.log('Message sent: ', res.ts);
      }).catch(err => {
        console.error('Error: ', err);
      });
    }
  });
});
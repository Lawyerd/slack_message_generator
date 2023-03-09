// const { WebClient } = require('@slack/web-api')
// const token = 'xoxb-4790746604496-4752529706471-EhUhXbLErn3WCAPQJuSCICfw'
// const slackBot = new WebClient(token)


// const sendMessage = async (message, channel) => {
//     try {
//       await slackBot.chat.postMessage({
//         channel: channel,
//         text: message
//       })
//     } catch (err) {
//       console.log(err.message)
//     }
//   }



// sendMessage(`hi`, 'C04ND0FHD3Q')

console.log(process.env.token)
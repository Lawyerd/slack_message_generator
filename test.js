
const { WebClient } = require('@slack/web-api')
const token = process.env.token
const slackBot = new WebClient(token)


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

const generateMessage = (deviceName, currentState, previousState,partCount, cycleTime, currentBlock) => {
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

const [message, blocks] = generateMessage('DVF-5000', 'STOP', 'ACTIVE', '13', '11m12s','X-820.160 Y1550.718')
sendMessage(message, blocks, 'C04T72Y5GF7')
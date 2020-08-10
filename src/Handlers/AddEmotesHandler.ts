import { MessageType, ADDEMOTES, BASE } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class AddEmotesHandler extends DefaultHandler {
  public messageType = MessageType.ADDEMOTES

  public prefix = ['setemotes']

  public async onCommand (msg: PrivmsgMessage) {
    const responseMessage = this.makeResponseMesage(msg) as ADDEMOTES

    // TODO: Add FFZ & BTTV emote detections.

    responseMessage.emotes = msg.emotes.map(emote => {
      return {
        name: emote.code,
        id: emote.id,
      }
    })

    this.ws.sendMessage(MessageType.ADDEMOTES, JSON.stringify(responseMessage))
  }

  public async onServerResponse ({ channelTwitch, userTwitch, result }: BASE) {
    this.twitch.sendMessage(channelTwitch.name, userTwitch.name, String(result.value))
  }
}

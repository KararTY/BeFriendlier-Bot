import { MessageType, EMOTES, BASE } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class EmotesHandler extends DefaultHandler {
  public messageType = MessageType.EMOTES

  public prefix = ['emotes']

  public async onCommand (msg: PrivmsgMessage) {
    const responseMessage = this.makeResponseMesage(msg) as EMOTES

    // TODO: Add FFZ & BTTV emote detections.

    responseMessage.emotes = msg.emotes.filter((emote, index, emotes) => {
      const em = emotes.slice(index + 1).find(em => em.id === emote.id)
      if (em === undefined) {
        return true
      }
    }).map(emote => {
      return {
        name: emote.code,
        id: emote.id,
      }
    }).slice(0, 5)

    this.ws.sendMessage(MessageType.EMOTES, JSON.stringify(responseMessage))
  }

  public async onServerResponse ({ channelTwitch, userTwitch, result }: BASE) {
    this.twitch.sendMessage(channelTwitch.name, userTwitch.name, String(result.value))
  }
}
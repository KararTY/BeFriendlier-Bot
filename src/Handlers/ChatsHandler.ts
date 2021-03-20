import { MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class ChatsHandler extends DefaultHandler {
  public messageType = MessageType.CHATS

  // public prefix = ['']

  // public async onCommand (msg: PrivmsgMessage) {}

  public async onServerResponse (requestTime: string) {
    const channels = Array.from(this.twitch.channels).map(([_id, channel]) => {
      return { id: channel.id, name: channel.name }
    })

    // If requestTime.length > 0, that means this is a requestResponse.
    const responseMessage = {
      requestTime: requestTime.length > 0 ? requestTime : undefined,
      value: channels,
    }

    this.ws.sendMessage(this.messageType, JSON.stringify(responseMessage))
  }
}

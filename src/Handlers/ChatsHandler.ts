import { MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class ChatsHandler extends DefaultHandler {
  public messageType = MessageType.CHATS

  // public prefix = ['']

  // public async onCommand (msg: PrivmsgMessage) {}

  public async onServerResponse (requestTime: string): Promise<void> {
    const channels = Array.from(this.twitch.channels).map(([_id, channel]) => {
      return { id: channel.id, name: channel.name }
    })

    // If requestTime.length > 0, that means this is a requestResponse.
    const responseMessage = {
      requestTime: requestTime.length > 0 ? requestTime : undefined,
      value: channels
    }

    if ([this.ws.client.CLOSED, this.ws.client.CLOSING, this.ws.client.CONNECTING].includes(this.ws.client.readyState as any)) {
      this.ws.client.once('open', () => this.ws.sendMessage(this.messageType, JSON.stringify(responseMessage)))
      return
    }

    this.ws.sendMessage(this.messageType, JSON.stringify(responseMessage))
  }
}

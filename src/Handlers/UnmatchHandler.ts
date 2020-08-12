import { UNMATCH, MessageType } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class UnmatchHandler extends DefaultHandler {
  public messageType = MessageType.UNMATCH

  public prefix = ['unmatch']

  public async onCommand (msg: PrivmsgMessage, words: string[]) {
    const responseMessage = this.makeResponseMesage(msg) as UNMATCH

    // Get user details for provided user.
    const res = await this.twitch.api.getUser(this.twitch.token.superSecret, [words[0]])
    if (res !== null && res.length > 0) {
      responseMessage.matchUserTwitch = {
        id: res[0].id,
        name: res[0].login,
      }

      this.ws.sendMessage(MessageType.UNMATCH, JSON.stringify(responseMessage))
    } else {
      this.twitch.sendMessage(msg.channelName, msg.senderUsername, 'could not find that user on Twitch.')
    }
  }

  public async onServerResponse ({ channelTwitch, userTwitch, result }: UNMATCH) {
    this.twitch.sendMessage(channelTwitch.name, userTwitch.name, String(result.value))
  }
}

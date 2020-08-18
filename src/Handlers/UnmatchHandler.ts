import { UNMATCH, MessageType } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import DefaultHandler from './DefaultHandler'
import messagesText from '../messagesText'

export default class UnmatchHandler extends DefaultHandler {
  public messageType = MessageType.UNMATCH

  public prefix = ['unmatch']

  public helpText = () => {
    return messagesText.helpText.unmatch
  }

  public async onCommand (msg: PrivmsgMessage, words: string[]) {
    const responseMessage = this.getNameAndIds(msg) as UNMATCH

    // Get user details for provided user.
    const res = await this.twitch.api.getUser(this.twitch.token.superSecret, [words[0]])
    if (res !== null && res.length > 0) {
      responseMessage.matchUserTwitch = {
        id: res[0].id,
        name: res[0].login,
      }

      this.ws.sendMessage(MessageType.UNMATCH, JSON.stringify(responseMessage))
    } else {
      this.twitch.sendMessage(
        responseMessage.channelTwitch,
        responseMessage.userTwitch,
        messagesText.twitchUserNotFound,
      )
    }
  }

  public async onServerResponse ({ channelTwitch, userTwitch, result }: UNMATCH) {
    this.twitch.sendMessage(channelTwitch, userTwitch, String(result.value))
  }
}

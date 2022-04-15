import { PrivmsgMessage } from '@kararty/dank-twitch-irc'
import { MessageType, UNMATCH } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class UnmatchHandler extends DefaultHandler {
  public messageType = MessageType.UNMATCH

  public prefix = ['unmatch']

  public helpText = (): string => {
    return this.i18n(this.messagesText.helpText.unmatch)
  }

  public async onCommand (msg: PrivmsgMessage, words: string[]): Promise<void> {
    const responseMessage = this.getNameAndIds(msg) as UNMATCH

    if (words[0] === undefined) {
      void this.twitch.sendMessage(
        responseMessage.channelTwitch, responseMessage.userTwitch, this.getHelpMessage())
      return
    }

    // Get user details for provided user.
    const res = await this.twitch.api.getUser(this.twitch.token.superSecret, [words[0]])
    if (res === null || res.length === 0) {
      void this.twitch.sendMessage(
        responseMessage.channelTwitch, responseMessage.userTwitch, this.i18n(this.messagesText.twitchUserNotFound))
      return
    }

    responseMessage.matchUserTwitch = {
      id: res[0].id,
      name: res[0].login
    }

    this.ws.sendMessage(this.messageType, JSON.stringify(responseMessage))
  }

  public async onServerResponse ({ channelTwitch, userTwitch, result }: UNMATCH): Promise<void> {
    void this.twitch.sendMessage(channelTwitch, userTwitch, String(result.value))
  }
}

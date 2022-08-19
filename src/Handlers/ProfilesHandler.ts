import { PrivmsgMessage } from '@kararty/dank-twitch-irc'
import { BASE, EMOTES, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class ProfilesHandler extends DefaultHandler {
  public messageType = MessageType.PROFILES

  public prefix = ['profiles']

  public helpText = (): string => this.i18n(this.messagesText.helpText.profiles)

  public async onCommand (msg: PrivmsgMessage, words: string[]): Promise<void> {
    const responseMessage = this.getNameAndIds(msg) as EMOTES

    // If user is trying to see the global profiles.
    responseMessage.global = this.isGlobal(responseMessage.channelTwitch, words)

    this.ws.sendMessage(this.messageType, JSON.stringify(responseMessage))
  }

  public async onServerResponse ({ channelTwitch, userTwitch, messageID, result }: BASE): Promise<void> {
    let msg: string

    if (result.value === false) {
      msg = this.i18n(this.messagesText.notHosted)
    } else {
      msg = this.i18n(this.messagesText.amountOfProfilesInChannel).replace('%s', result.value.count).replace('%s', this.noPingsStr(result.value.channelName))
    }

    void this.twitch.sendMessage(channelTwitch, userTwitch, msg, messageID)
  }
}

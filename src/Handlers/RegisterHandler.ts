import { BASE, MessageType, REGISTER } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'
import messagesText from '../messagesText'
import { PrivmsgMessage, WhisperMessage } from 'dank-twitch-irc'

export default class RegisterHandler extends DefaultHandler {
  public messageType = MessageType.REGISTER

  public prefix = ['register']

  public helpText = () => messagesText.helpText.register

  public async onCommand (msg: PrivmsgMessage) {
    const base = this.getNameAndIds(msg)
  
    this.twitch.sendMessage(base.channelTwitch, base.userTwitch, messagesText.twitchUserNotFound)
  }

  public async onWhisperCommand (whMsg: WhisperMessage, words: string[]) {
    const responseMessage = this.getNameAndIds(whMsg) as REGISTER

    if (words[0] !== 'accept') {
      await this.twitch.sendWhisper(responseMessage.userTwitch, messagesText.registrationDisclaimer)
      return
    }

    // Get user details for provided user.
    const res = await this.twitch.api.getUser(this.twitch.token.superSecret, [whMsg.senderUsername])
    if (res !== null && res.length > 0) {
      responseMessage.userTwitch = {
        id: res[0].id,
        name: res[0].login,
        displayName: res[0].display_name,
        avatar: res[0].profile_image_url
      }

      this.ws.sendMessage(this.messageType, JSON.stringify(responseMessage))
    } else {
      await this.twitch.sendWhisper(responseMessage.userTwitch, messagesText.twitchUserNotFound)
    }
  }

  public async onServerResponse ({ userTwitch, result }: BASE) {
    await this.twitch.sendWhisper(userTwitch, result.value
      ? messagesText.registrationSuccessful
      : messagesText.alreadyRegistered
    )
  }
}

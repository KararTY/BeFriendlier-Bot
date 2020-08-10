import { MessageType, Token } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class TokenHandler extends DefaultHandler {
  public messageType = MessageType.TOKEN

  // public prefix = ['']

  // public async onCommand (msg: PrivmsgMessage) {}

  public async onServerResponse (res: Token) {
    this.twitch.token = res

    // Login / Relogin to Twitch
    return await this.twitch.loginToTwitch()
  }
}

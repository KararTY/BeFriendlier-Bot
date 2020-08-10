import { MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class WelcomeHandler extends DefaultHandler {
  public messageType = MessageType.WELCOME

  // public prefix = ['']

  public async onCommand () {
    this.ws.sendMessage(MessageType.WELCOME, '')
  }

  public async onServerResponse () {
    await this.onCommand()
  }
}

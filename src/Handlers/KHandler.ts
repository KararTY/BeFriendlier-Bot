import { PrivmsgMessage } from '@kararty/dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class MiscKHandler extends DefaultHandler {
  public instantResponse = true

  public prefix = ['/announce j']

  public helpText = (): null => null

  public async onCommand (msg: PrivmsgMessage): Promise<void> {
    if (msg.senderUserID === '460203752' && msg.channelID === '11148817') {
      void this.twitch.ircClient.say(msg.channelName, '. /announce k')
    }
  }
}

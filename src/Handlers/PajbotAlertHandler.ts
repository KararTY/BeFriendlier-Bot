import { PrivmsgMessage } from '@kararty/dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class MiscHandler extends DefaultHandler {
  public instantResponse = true

  public prefix = ['pajaS 🚨 ALERT']

  public helpText = (): null => null

  public async onCommand (msg: PrivmsgMessage): Promise<void> {
    if (msg.senderUserID === '82008718' && msg.channelID === '11148817') {
      void this.twitch.ircClient.me(msg.channelName, 'monkaPickle 🚨 VARNING')
    }
  }
}

import { PrivmsgMessage } from '@kararty/dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class MiscHandler extends DefaultHandler {
  public instantResponse = true

  private readonly responses = [
    'monkaPickle 🚨 I NEED A MEDIC BAG',
    'monkaPickle 🚨 JÄVLAR',
    'monkaPickle 🚨 VAD FAN I HELVETE',
    'monkaPickle 🚨 AHHHHH',
    'monkaPickle 🚨 THE ALERT, GO GET IT',
    'monkaPickle 🚨 LISTEN UP, THIS IS AN ALERT'
  ]

  public prefix = ['pajaS 🚨 ALERT']

  public async onCommand (msg: PrivmsgMessage): Promise<void> {
    if (msg.senderUserID === '82008718' && msg.channelID === '11148817') {
      const randomResponse = this.responses[Math.floor(Math.random() * this.responses.length)]
      void this.twitch.ircClient.say(msg.channelName, randomResponse)
    }
  }
}

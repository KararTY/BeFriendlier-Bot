import { BASE, MessageType } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import messagesText from '../messagesText'
import DefaultHandler from './DefaultHandler'

export default class PingHandler extends DefaultHandler {
  public messageType = MessageType.PING

  public prefix = ['ping']

  public helpText = () => messagesText.helpText.ping

  public async onCommand (msg: PrivmsgMessage) {
    const responseMessage = this.getNameAndIds(msg)

    const dateNow = Date.now()
    await this.twitch.ircClient.ping()
    const dateAfterPing = Date.now()
    responseMessage.result = { pingFromBotToTwitch: dateAfterPing - dateNow }
    this.ws.sendMessage(MessageType.PING, JSON.stringify(responseMessage))
  }

  public async onServerResponse (data: BASE | undefined, res: { timestamp: number }) {
    if (data !== undefined) {
      this.twitch.sendMessage(
        data.channelTwitch,
        data.userTwitch,
        `ping from Bot to Twitch: ~${String(data.result.pingFromBotToTwitch)} ms. ` +
        `Ping from Bot to Website: ~${String(Date.now() - res.timestamp)} ms.`,
      )
    } else {
      // TODO: Looks like this is a healthcheck!
    }
  }
}

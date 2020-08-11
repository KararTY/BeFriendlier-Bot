import { MessageType, ROLLMATCH } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class RollMatchHandler extends DefaultHandler {
  public messageType = MessageType.ROLLMATCH

  public prefix = ['swipe', 'roll']

  public async onCommand (msg: PrivmsgMessage, words: string[]) {
    const responseMessage = this.makeResponseMesage(msg) as ROLLMATCH

    let foundUserRoll = this.twitch.getUserInstance(msg)

    if (foundUserRoll !== undefined) {
      return
    }

    let isGlobal = false
    if (words[1] === 'global') {
      isGlobal = true
      responseMessage.global = true
    }

    foundUserRoll = this.twitch.createAndGetUserInstance(msg, isGlobal)

    responseMessage.more = foundUserRoll.type

    this.ws.sendMessage(MessageType.ROLLMATCH, JSON.stringify(responseMessage))
  }

  public async onServerResponse ({ channelTwitch, userTwitch, result }: ROLLMATCH) {
    this.twitch.sendMessage(channelTwitch.name, userTwitch.name, String(result.value))
  }
}

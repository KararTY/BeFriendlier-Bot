import { MessageType, ROLLMATCH, More } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class RollMatchHandler extends DefaultHandler {
  public messageType = MessageType.ROLLMATCH

  public prefix = ['swipe', 'roll']

  public helpText = () => {
    return 'initiates a match! Good luck, rubber ducky 🦆' +
      'Append "global" to initiate a match with global profiles.'
  }

  public async onCommand (msg: PrivmsgMessage, words: string[]) {
    const responseMessage = this.getNameAndIds(msg) as ROLLMATCH

    let foundUserRoll = this.twitch.getUserInstance(msg)

    if (foundUserRoll !== undefined) {
      return
    }

    let isGlobal = false
    if (words[0] === 'global') {
      isGlobal = true
      responseMessage.global = true
    }

    foundUserRoll = this.twitch.createAndGetUserInstance(msg, isGlobal)

    responseMessage.more = foundUserRoll.type

    this.ws.sendMessage(MessageType.ROLLMATCH, JSON.stringify(responseMessage))
  }

  public async onServerResponse ({ channelTwitch, userTwitch, result, more }: ROLLMATCH) {
    if (more === More.NONE) {
      result.value = result.value
        .replace('%prefix%', '@@')
        .replace('%prefix%', '@@')
        .replace('%prefix%', '@@')
    }

    this.twitch.sendMessage(channelTwitch, userTwitch, String(result.value))
  }
}

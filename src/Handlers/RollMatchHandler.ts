import { MessageType, More, ROLLMATCH } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import { RollInstance } from '../Twitch'
import messagesText from '../messagesText'
import DefaultHandler from './DefaultHandler'

export default class RollMatchHandler extends DefaultHandler {
  public messageType = MessageType.ROLLMATCH

  public prefix = ['swipe', 'roll']

  public helpText = () => {
    return this.i18n(this.messagesText.helpText.rollMatch)
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

    this.ws.sendMessage(this.messageType, JSON.stringify(responseMessage))
  }

  public async onServerResponse ({ channelTwitch, userTwitch, result, more }: ROLLMATCH) {
    if (more === More.NONE) {
      result.value = result.value
        .replace('%prefix%', '@@')
        .replace('%prefix%', '@@')
        .replace('%prefix%', '@@')
    }

    const foundUserRoll = this.twitch.getUserInstance({ senderUserID: userTwitch.id, channelID: channelTwitch.id } as PrivmsgMessage) as RollInstance

    if (foundUserRoll.lastType === more) {
      this.twitch.sendMessage(channelTwitch, userTwitch, messagesText.ood)
      return
    }

    if (more) {
      foundUserRoll.type = more
    }

    this.twitch.sendMessage(channelTwitch, userTwitch, String(result.value))
  }
}

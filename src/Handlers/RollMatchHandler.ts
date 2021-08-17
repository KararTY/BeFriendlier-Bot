import { Emote, MessageType, More, ROLLMATCH } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import { RollInstance, User } from '../Twitch'
import DefaultHandler from './DefaultHandler'

export default class RollMatchHandler extends DefaultHandler {
  public messageType = MessageType.ROLLMATCH

  public prefix = ['swipe', 'roll']

  public helpText = () => {
    return this.i18n(this.messagesText.helpText.rollMatch)
  }

  public async onCommand (msg: PrivmsgMessage, words: string[]) {
    const responseMessage = this.getNameAndIds(msg) as ROLLMATCH

    const foundUserRoll = this.twitch.getUserInstance(msg)

    if (foundUserRoll !== undefined) {
      await this.twitch.sendWhisper(responseMessage.userTwitch, this.i18n(this.messagesText.alreadyRolling))
      return
    }

    if (words[0] === 'global') {
      responseMessage.global = true
    }

    responseMessage.more = More.NONE

    this.ws.sendMessage(this.messageType, JSON.stringify(responseMessage))
  }

  public async onServerResponse ({ channelTwitch, userTwitch, result, more, global }: ROLLMATCH) {
    const { profile, user } = result.value

    const userRoll = this.twitch.setUserInstance(
      { channelID: channelTwitch.id, senderUserID: userTwitch.id, data: { profile, user } }, global)

    userRoll.type = more || More.NONE

    void matchText(
      { channelTwitch, userTwitch},
      { logger: this.logger, twitch: this.twitch, getEmotes: () => this.getEmotes(), i18n: (str) => this.i18n(str), noPingsStr: this.noPingsStr },
      userRoll
    )
  }
}


export async function matchText ({ channelTwitch, userTwitch }: ROLLMATCH, { logger, twitch, getEmotes, i18n, noPingsStr }, roll?: RollInstance) {
  let message = ''
  let foundUserRoll = roll

  if (!foundUserRoll) {
    foundUserRoll = twitch.getUserInstance(
      { channelID: channelTwitch.id, senderUserID: userTwitch.id } as PrivmsgMessage)
  }

  if (!foundUserRoll) {
    // Doubly check for good measure.
    logger.error('No RollInstance found for user %s, in channel %s',
      userTwitch.id, global ? twitch.name : channelTwitch.name)
      twitch.removeUserInstance({ channelTwitch, userTwitch })
    return
  }

  const { profile, user } = foundUserRoll.data

  // Skip some stuff if user doesn't define anything.

  if (foundUserRoll.type === More.BIO && profile.bio.length < 33) {
    foundUserRoll.type = More.FAVORITEEMOTES
  }

  const emotes = await getEmotes()
  const bio = profile.bio.split(' ').map(word => emotes.findIndex(ee => ee.name === word) > -1 ? word : noPingsStr(word)).join(' ')

  const globalStr = foundUserRoll.global === true ? 'global ' : ''
  const prefix = twitch.commandPrefix
  const firstTimeText = `Reply with ${prefix}more, ${prefix}match or ${prefix}no`

  switch (foundUserRoll.type) {
    case More.NONE:
      message = `new ${globalStr}match's bio: ${bio.length > 32 ? `${bio.substr(0, 32)}...` : bio}`
      break
    case More.BIO:
      message = `${foundUserRoll.global === true ? 'global\'s ' : ''}full bio: ${bio}`
      break
    case More.FAVORITEEMOTES:
      message = `${globalStr}match's favorite emotes: ` +
        `${profile.favorite_emotes.length > 0 ? profile.favorite_emotes.map((emote: Emote) => emote.name).join(' ') : 'None.'}`
      break
    case More.FAVORITESTREAMERS:
      message = `${globalStr}match's favorite streamers: ` +
        `${user.favorite_streamers.length > 0 ? user.favorite_streamers.map((streamer: User) => noPingsStr(streamer.name)).join(' ') : 'None.'}`
      break
  }

  if (!foundUserRoll.lastType) {
    message += ` ${firstTimeText}`
  }

  if (foundUserRoll.type === foundUserRoll.lastType) {
    twitch.sendMessage(channelTwitch, userTwitch, i18n(this.messagesText.ood))
    return
  }

  foundUserRoll.nextType()

  twitch.setUserInstance({
    channelID: channelTwitch.id, senderUserID: userTwitch.id, data: {
      ...foundUserRoll.data, type: foundUserRoll.type, lastType: foundUserRoll.lastType
    }
  }, foundUserRoll.global)

  twitch.sendMessage(channelTwitch, userTwitch, message)
}
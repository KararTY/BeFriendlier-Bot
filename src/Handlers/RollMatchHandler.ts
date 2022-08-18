import { Logger } from '@adonisjs/logger'
import { PrivmsgMessage } from '@kararty/dank-twitch-irc'
import { Emote, MessageType, More, ROLLMATCH } from 'befriendlier-shared'
import pajbotBanphraseCheck from '../banphrase'
import Client, { RollInstance, User } from '../Twitch'
import BioHandler from './BioHandler'
import DefaultHandler from './DefaultHandler'

export default class RollMatchHandler extends DefaultHandler {
  public messageType = MessageType.ROLLMATCH

  public prefix = ['swipe', 'roll']

  public helpText = (): string => {
    return this.i18n(this.messagesText.helpText.rollMatch)
  }

  public async onCommand (msg: PrivmsgMessage, words: string[]): Promise<void> {
    const responseMessage = this.getNameAndIds(msg) as ROLLMATCH

    const foundUserRoll = this.twitch.getUserInstance(msg)

    if (foundUserRoll !== undefined) {
      await this.twitch.sendMessage(
        responseMessage.channelTwitch,
        responseMessage.userTwitch,
        this.i18n(this.messagesText.alreadyRolling),
        responseMessage.messageID
      )
      return
    }

    if (this.isGlobal(responseMessage.channelTwitch, words)) {
      responseMessage.global = true
    }

    responseMessage.more = More.NONE

    this.ws.sendMessage(this.messageType, JSON.stringify(responseMessage))
  }

  public async onServerResponse ({ channelTwitch, userTwitch, messageID, result, more, global }: ROLLMATCH): Promise<void> {
    const { profile, user } = result.value

    const userRoll = this.twitch.setUserInstance(
      { channelID: channelTwitch.id, senderUserID: userTwitch.id, data: { profile, user } }, global)

    userRoll.type = more ?? More.NONE

    void matchText(
      { channelTwitch, userTwitch, messageID },
      {
        logger: this.logger,
        twitch: this.twitch,
        getEmotes: async () => await this.getEmotes(),
        i18n: { messagesText: this.messagesText, parse: (str: string) => this.i18n(str) },
        noPingsStr: this.noPingsStr
      },
      userRoll
    )
  }
}

export async function matchText (
  { channelTwitch, userTwitch, messageID, global }: ROLLMATCH,
  { logger, twitch, getEmotes, i18n, noPingsStr }: { logger: Logger, twitch: Client, getEmotes: () => Promise<Emote[]>, i18n: { messagesText: any, parse: (str: string) => string }, noPingsStr: (str: string) => string },
  roll?: RollInstance
): Promise<void> {
  let message = ''
  let foundUserRoll = roll

  if (foundUserRoll === undefined) {
    foundUserRoll = twitch.getUserInstance({ channelID: channelTwitch.id, senderUserID: userTwitch.id })
  }

  // Doubly check for good measure.
  if (foundUserRoll === undefined) {
    logger.error('No RollInstance found for user %s, in channel %s',
      userTwitch.id, global === false ? twitch.name : channelTwitch.name)
    twitch.removeUserInstance({ channelTwitch, userTwitch })
    return
  }

  const { profile, user } = foundUserRoll.data

  // Skip some stuff if user doesn't define anything.

  if (foundUserRoll.type === More.BIO && profile.bio.length < 32) {
    foundUserRoll.type = More.FAVORITESTREAMERS
  }

  const emotes = await getEmotes()
  let bio = profile.bio.split(' ').map(word => emotes.findIndex(ee => ee.name === word) > -1 ? word : noPingsStr(word)).join(' ')

  // CHECK BANPHRASE FOR BIO
  let checkMessages: string[] = []

  if (foundUserRoll.type !== More.FAVORITESTREAMERS) {
    checkMessages = await pajbotBanphraseCheck(channelTwitch.name, twitch.filterMsg(bio))

    if (checkMessages.length > 0) {
      bio = checkMessages.join(' ')
    }
  }

  const globalStr = foundUserRoll.global ? 'global ' : ''
  const prefix = twitch.commandPrefix
  const firstTimeText = `Reply with ${prefix}more, ${prefix}match or ${prefix}no`
  const censoredStr = checkMessages.length > 0 ? 'censored ' : ''

  switch (foundUserRoll.type) {
    case More.BIO:
      message = `${globalStr}match's full ${censoredStr}profile: ${BioHandler.shortenText(bio, 128)}`
      break
    case More.FAVORITESTREAMERS:
      message = `${globalStr}match's favorite streamers: ` +
        `${user.favorite_streamers.length > 0 ? user.favorite_streamers.map((streamer: User) => noPingsStr(streamer.name)).join(' ') : 'None.'}`
      break
    default:
      message = `new ${globalStr}match's ${censoredStr}profile: ${BioHandler.shortenText(bio)}.`
      break
  }

  if (foundUserRoll.lastType === undefined) {
    message += ' ' + firstTimeText
  }

  if (foundUserRoll.type === foundUserRoll.lastType) {
    void twitch.sendMessage(
      channelTwitch,
      userTwitch,
      i18n.parse(String(i18n.messagesText.ood) + ' Reply with %prefix%match or %prefix%no'),
      messageID
    )
    return
  }

  foundUserRoll.nextType()

  twitch.setUserInstance({
    channelID: channelTwitch.id,
    senderUserID: userTwitch.id,
    data: {
      ...foundUserRoll.data, type: foundUserRoll.type, lastType: foundUserRoll.lastType
    }
  }, foundUserRoll.global)

  void twitch.sendMessage(channelTwitch, userTwitch, message, messageID)
}

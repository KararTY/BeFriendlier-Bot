import { Logger } from '@adonisjs/logger'
import { PrivmsgMessage, WhisperMessage } from '@kararty/dank-twitch-irc'
import { BASE, Emote, NameAndId, PajbotAPI } from 'befriendlier-shared'
import messagesText from '../messagesText'
import Client from '../Twitch'
import Ws from '../Ws'

export default class DefaultHandler {
  protected readonly twitch: Client
  protected readonly ws: Ws
  protected readonly messagesText = messagesText
  protected readonly pajbotAPI: PajbotAPI
  protected readonly logger: Logger

  public messageType = 'DEFAULT'
  public prefix: string[] = []
  public adminOnly = false
  public instantResponse = false

  public cachedTwitch = {
    nextUpdate: Date.now(),
    emotes: [] as Emote[]
  }

  public helpText = (): string => this.i18n(this.messagesText.helpText.none)

  constructor (twitch: Client, ws: Ws, pajbotAPI: PajbotAPI, logger: Logger) {
    this.twitch = twitch
    this.ws = ws
    this.pajbotAPI = pajbotAPI
    this.logger = logger
  }

  public getNameAndIds (msg: PrivmsgMessage | WhisperMessage): BASE {
    return {
      userTwitch: {
        name: msg.senderUsername,
        id: msg.senderUserID
      },
      channelTwitch: (msg instanceof WhisperMessage || typeof msg.channelID === 'undefined')
        ? {
            // Set "global" BeFriendlier channel.
            name: this.twitch.name,
            id: this.twitch.id
          }
        : {
            name: msg.channelName,
            id: msg.channelID
          }
    }
  }

  // TODO: Finish i18n implementation.
  public i18n (text: string): string {
    return text.replace(/%prefix%/g, this.twitch.commandPrefix)
  }

  public async getEmotes (): Promise<Emote[]> {
    let emotes: Emote[] = this.cachedTwitch.emotes

    if (Date.now() > this.cachedTwitch.nextUpdate) {
      const resEmotes = await this.twitch.api.getGlobalEmotes(this.twitch.token.superSecret)
      if (resEmotes !== null) this.cachedTwitch.emotes = resEmotes
      emotes = this.cachedTwitch.emotes
      this.cachedTwitch.nextUpdate = Date.now() + 21600000 // 6 h
    }

    return emotes
  }

  public noPingsStr (str: string): string {
    return str.substring(0, 1) + '\u{E0000}' + str.substring(1)
  }

  public isGlobal (channelTwitch: NameAndId, words: string[]): boolean {
    return (channelTwitch.id === this.twitch.id) || (words[0] === 'global')
  }

  public async onCommand (_msg?: PrivmsgMessage, _words?: string[]): Promise<void> {}

  public async onWhisperCommand (_msg?: WhisperMessage, _words?: string[]): Promise<void> {}

  public async onServerResponse (_res: any, _raw?: any): Promise<void> {
    if (typeof _res.data !== 'undefined' && _res.data.length > 0) {
      const data: BASE = JSON.parse(_res.data)
      this.logger.error(`${this.constructor.name}.onServerResponse(): RECEIVED UNHANDLED MESSAGETYPE [${String(_res.type)}]: %O`, _res)
      if (data.channelTwitch !== undefined && data.userTwitch !== undefined) {
        this.twitch.removeUserInstance(data)
      }
    } else {
      this.logger.error(`${this.constructor.name}.onServerResponse(): RECEIVED UNHANDLED MESSAGE: %O`, _res)
    }
  }

  public getHelpMessage (): string {
    return `${this.prefix[0]}: ${this.helpText()}`
  }
}

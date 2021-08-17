import { Logger } from '@adonisjs/logger/build/standalone'
import { BASE, Emote } from 'befriendlier-shared'
import { PrivmsgMessage, WhisperMessage } from 'dank-twitch-irc'
import messagesText from '../messagesText'
import Client from '../Twitch'
import Ws from '../Ws'

export default class DefaultHandler {
  protected readonly twitch: Client
  protected readonly ws: Ws
  protected readonly messagesText = messagesText
  protected readonly logger: Logger

  public messageType = 'DEFAULT'
  public prefix: string[] = []
  public adminOnly = false

  public cachedTwitch = {
    nextUpdate: Date.now(),
    emotes: [] as Emote[]
  }

  public helpText = () => this.i18n(this.messagesText.helpText.none)

  constructor (twitch: Client, ws: Ws, logger: Logger) {
    this.twitch = twitch
    this.ws = ws
    this.logger = logger
  }

  public getNameAndIds (msg: PrivmsgMessage | WhisperMessage): BASE {
    return {
      userTwitch: {
        name: msg.senderUsername,
        id: msg.senderUserID,
      },
      channelTwitch: msg instanceof WhisperMessage ? {
        // Set "global" Befriendlier channel.
        name: this.twitch.name,
        id: this.twitch.id
      } : {
        name: msg.channelName,
        id: msg.channelID,
      },
    }
  }

  // TODO: Finish i18n implementation.
  public i18n (text: string) {
    return text.replace(/%prefix%/g, this.twitch.commandPrefix)
  }

  public async getEmotes () {
    let emotes: Emote[] = this.cachedTwitch.emotes

    if (Date.now() > this.cachedTwitch.nextUpdate) {
      const resEmotes = await this.twitch.api.getGlobalEmotes(this.twitch.token.superSecret)
      if (resEmotes !== null) this.cachedTwitch.emotes = resEmotes
      emotes = this.cachedTwitch.emotes
      this.cachedTwitch.nextUpdate = Date.now() + 21600000 // 6 h
    }

    return emotes
  }

  public noPingsStr (str: string) {
    return str.substr(0, 1) + '\u{E0000}' + str.substr(1)
  }

  public async onCommand (_msg?: PrivmsgMessage, _words?: string[]) {}
  public async onWhisperCommand (_msg?: WhisperMessage, _words?: string[]) {}

  public async onServerResponse (_res: any, _raw?: any) {
    if (_res.data && _res.data.length > 0) {
      const data: BASE = JSON.parse(_res.data)
      this.logger.error(`${this.constructor.name}.onServerResponse(): RECEIVED UNHANDLED MESSAGETYPE [${String(_res.type)}]: %O`, _res)
      if (data.channelTwitch !== undefined && data.userTwitch !== undefined) {
        this.twitch.removeUserInstance(data)
      }
    } else {
      this.logger.error(`${this.constructor.name}.onServerResponse(): RECEIVED UNHANDLED MESSAGE: %O`, _res)
    }
  }
}

import { Logger } from '@adonisjs/logger/build/standalone'
import { BASE } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import Client from '../Twitch'
import Ws from '../Ws'

export default class DefaultHandler {
  protected readonly twitch: Client
  protected readonly ws: Ws
  protected readonly logger: Logger

  public messageType = 'DEFAULT'
  public prefix: string[] = []
  public adminOnly = false

  public helpText = () => 'This command has no help usage.'

  constructor (twitch: Client, ws: Ws, logger: Logger) {
    this.twitch = twitch
    this.ws = ws
    this.logger = logger
  }

  public makeResponseMesage (msg: PrivmsgMessage): BASE {
    return {
      userTwitch: {
        name: msg.senderUsername,
        id: msg.senderUserID,
      },
      channelTwitch: {
        name: msg.channelName,
        id: msg.channelID,
      },
    }
  }

  public async onCommand (_msg?: PrivmsgMessage, _words?: string[]) {}

  public async onServerResponse (_res: any, _raw?: any) {
    if (_res.data.length > 0) {
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

/* eslint-disable no-void */
import { Logger } from '@adonisjs/logger/build/standalone'
import { BASE, MessageType, More, NameAndId, TwitchAuth } from 'befriendlier-shared'
import {
  AlternateMessageModifier,
  ChatClient,
  ClearchatMessage,
  ClearmsgMessage,
  ConnectionError,
  PrivmsgMessage,
  PrivmsgMessageRateLimiter,
  SlowModeRateLimiter,
} from 'dank-twitch-irc'
import PQueue from 'p-queue'
import TwitchConfig from '../config/Twitch'
import DefaultHandler from './Handlers/DefaultHandler'
import Ws, { WsRes } from './Ws'

function escapeRegExp (text: string) {
  return text.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')
}

interface Token {
  expiration: Date
  superSecret: string
  refreshToken: string
}

export interface Channel {
  id: string
  name: string
  cooldown: Date
  userRolls: Map<string, RollInstance>
}

class Message {
  public readonly msg: PrivmsgMessage
  public deleted = false
  public timer: NodeJS.Timeout

  constructor (msg: PrivmsgMessage, clientRef: any) {
    this.msg = msg

    this.timer = setTimeout(() => {
      clientRef.onMessage(this)
    }, 1000)
  }
}

export class RollInstance {
  public type: More

  constructor () {
    this.type = More.NONE
  }

  public nextType () {
    switch (this.type) {
      case More.NONE:
        this.type = More.BIO
        break
      case More.BIO:
        this.type = More.FAVORITEEMOTES
        break
      case More.FAVORITEEMOTES:
        this.type = More.FAVORITESTREAMERS
        break
      case More.FAVORITESTREAMERS:
        this.type = More.BIO
        break
    }
  }
}

export default class Client {
  private readonly ws: Ws
  private readonly logger: Logger

  private readonly name: string

  public readonly commandPrefix: string

  private reconnectAttempts: number = 0

  private ready = false

  private readonly generalQueue = new PQueue({ concurrency: 1 })

  public readonly api: TwitchAuth
  public readonly packageJSON: any
  public token: Token

  public ircClient: ChatClient

  public readonly msgs: Map<string, Message> = new Map()
  public readonly channels: Map<string, Channel> = new Map()

  public readonly handlers: DefaultHandler[] = []

  public readonly admins: string[] | undefined

  constructor (config: TwitchConfig, ws: Ws, api: TwitchAuth, packageJSON: any, logger: Logger) {
    this.api = api
    this.ws = ws

    this.packageJSON = packageJSON

    this.logger = logger

    this.name = config.user.name

    this.commandPrefix = config.commandPrefix

    this.admins = config.admins

    this.ws.eventEmitter.on('WS.MESSAGE', (data: WsRes) => this.onServerResponse(data))
    this.ws.eventEmitter.on('WS.CLOSED', (data) => this.onServerClosed(data))
  }

  public async onMessage ({ msg, deleted }: Message) {
    if (deleted) {
      return
    }

    // Filter bad words.
    // TODO: Add a global filter.
    if (msg.flags instanceof Array) {
      for (let index = 0; index < msg.flags.length; index++) {
        const word = msg.flags[index].word
        const censorStars = Array(word.length).fill('*').join('')
        msg.messageText.replace(new RegExp(escapeRegExp(word)), censorStars)
      }
    }

    const words = msg.messageText.split(' ')

    void this.generalQueue?.add(async () =>
      await this.handlers.find(command => command.prefix.includes(words[0].toLowerCase()))?.onCommand(msg, words))
  }

  public sendMessage (channelName: string, username: string, message: string) {
    this.ircClient.say(channelName, `@${username}, ${message}`)
      .catch(error => this.logger.error({ err: error }, 'Twitch.sendMessage()'))
  }

  public joinChannel ({ id, name }: NameAndId) {
    this.channels.set(id, {
      id,
      name: name,
      cooldown: new Date(),
      userRolls: new Map(),
    })
  }

  public leaveChannel ({ id, name }: NameAndId) {
    this.channels.delete(id)

    this.ircClient.part(name).then(() => this.logger.info(`Twitch.leaveChannel() -> Twitch.PART: ${name}`)).catch(
      error => this.logger.error({ err: error }, 'Twitch.leaveChannel() -> Twitch.PART'))
  }

  public createAndGetUserInstance (msg: PrivmsgMessage) {
    this.channels.get(msg.channelID)?.userRolls.set(msg.senderUserID, new RollInstance())
    return this.getUserInstance(msg) as RollInstance
  }

  public getUserInstance (msg: PrivmsgMessage) {
    return this.channels.get(msg.channelID)?.userRolls.get(msg.senderUserID)
  }

  public removeUserInstance ({ channelTwitch, userTwitch }: BASE) {
    const userInstance = this.channels.get(channelTwitch.id)?.userRolls.get(userTwitch.id)

    if (userInstance !== undefined) {
      this.channels.get(channelTwitch.id)?.userRolls.delete(userTwitch.id)
    }
  }

  private onServerResponse (res: WsRes) {
    const command = this.handlers.find(command => command.messageType === res.type)

    if (command === undefined || res.data === undefined) {
      void this.generalQueue.add(async () =>
        await this.handlers.find(command => command.messageType === 'DEFAULT')?.onServerResponse(res),
      { priority: Date.now() })

      return
    }

    const data = JSON.parse(res.data)

    void this.generalQueue.add(async () => await command.onServerResponse(data, res), { priority: Date.now() })
  }

  public async loginToTwitch () {
    // We clean off all events, just for precautionary measures.
    if (this.ircClient !== undefined) {
      this.ircClient.removeAllListeners()
      this.ircClient.close()
      ;(this.ircClient as any) = undefined
    }

    // Relogin to chat!
    this.ircClient = new ChatClient({
      password: `oauth:${this.token.superSecret}`,
      rateLimits: 'default',
      username: this.name,
      connection: {
        type: 'websocket',
        secure: true,
      },
    })

    this.ircClient.use(new AlternateMessageModifier(this.ircClient))
    this.ircClient.use(new SlowModeRateLimiter(this.ircClient))
    this.ircClient.use(new PrivmsgMessageRateLimiter(this.ircClient))

    // Re-add/Add Twitch socket events
    this.ircClient.on('372', (msg) => {
      this.logger.info(`Twitch.372: ${msg.ircParameters.join(' ')}`)
    })

    this.ircClient.once('ready', () => {
      this.logger.info('Twitch.READY: Successfully connected to Twitch IRC.')
      this.ready = true
    })
    this.ircClient.on('error', (error) => this.onError(error))

    // All messages are delayed by 1000ms for time-out checking.
    this.ircClient.on('PRIVMSG', (msg) => {
      if (!msg.messageText.startsWith(this.commandPrefix)) {
        return
      }

      const foundChannel = this.channels.get(msg.channelID)

      if (foundChannel === undefined) {
        this.leaveChannel({ id: msg.channelID, name: msg.channelName })
        return
      } else if (foundChannel.cooldown.getTime() > Date.now()) {
        return
      }

      foundChannel.cooldown = new Date(Date.now() + 5000)

      // Message class has a "clientRef" to "this" so it can call clientRef.onMessage().
      this.msgs.set(msg.messageID, new Message(msg, this))
    })

    this.ircClient.on('CLEARCHAT', (msg) => this.deleteMessage(msg))
    this.ircClient.on('CLEARMSG', (msg) => this.deleteMessage(msg))

    // Finally, connect to Twitch IRC.
    return this.ircClient.connect()
  }

  public async checkReady (): Promise<any> {
    if (!this.ready) {
      await new Promise(resolve => setTimeout(resolve, 500))
      this.generalQueue.concurrency++
      return await this.checkReady()
    } else {
      this.generalQueue.concurrency = 1
      return await Promise.resolve()
    }
  }

  private onServerClosed (data: { type: MessageType, data: string, state: 0 | 2 | 3 }) {
    const responseMessage = data.state === this.ws.client.CONNECTING
      ? 'Please wait, service is currently in the process of starting. Try again in a bit!'
      : data.state === this.ws.client.CLOSING
        ? 'service is currently shutting down. Check the website for status updates!'
        : 'service is currently down! Check the website for status updates!'

    const res: BASE = JSON.parse(data.data)

    this.sendMessage(res.channelTwitch.name, res.userTwitch.name, responseMessage)

    this.removeUserInstance(res)
  }

  private deleteMessage (msg: ClearchatMessage | ClearmsgMessage) {
    for (const [, cachedMsg] of this.msgs) {
      const removeMsgBool = msg instanceof ClearchatMessage
        ? cachedMsg.msg.channelName === msg.channelName
        : msg instanceof ClearmsgMessage
          ? cachedMsg.msg.messageID === msg.targetMessageID
          : false

      if (removeMsgBool) {
        cachedMsg.deleted = true
        clearTimeout(cachedMsg.timer)
      }
    }
  }

  private onError (error: Error) {
    this.logger.error({ err: error }, 'Twitch.onError()')

    if (error instanceof ConnectionError) {
      this.reconnectAttempts++

      const timeSeconds = this.reconnectAttempts > 50 ? 60 : (this.reconnectAttempts + 9)

      this.logger.info(`TWITCH.CLOSE: ATTEMPT #${this.reconnectAttempts}. Reconnecting in ${timeSeconds} seconds...`)

      this.channels.clear()

      this.ready = false

      setTimeout(() => {
        void this.loginToTwitch()
      }, timeSeconds * 1000)
    }
  }
}

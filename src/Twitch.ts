/* eslint-disable no-void */
import { Logger } from '@adonisjs/logger/build/standalone'
import { BASE, MessageType, More, NameAndId, TwitchAuth } from 'befriendlier-shared'
import {
  ChatClient,
  ClearchatMessage,
  ClearmsgMessage,
  PrivmsgMessage,
  PrivmsgMessageRateLimiter,
  SlowModeRateLimiter,
} from 'dank-twitch-irc'
import PQueue from 'p-queue'
import TwitchConfig from '../config/Twitch'
import DefaultHandler from './Handlers/DefaultHandler'
import Ws, { WsRes } from './Ws'

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
  addInvisibleSuffix: boolean
}

class Message {
  public readonly msg: PrivmsgMessage
  public deleted = false
  public timer: NodeJS.Timeout

  constructor (msg: PrivmsgMessage, clientRef: any) {
    this.msg = msg

    // All messages are delayed by 1100ms for time-out checking.
    this.timer = setTimeout(() => {
      clientRef.onMessage(this)
    }, 1100)
  }
}

export class RollInstance {
  public type: More
  public global: boolean

  constructor (global = false) {
    this.type = More.NONE
    this.global = global
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
  private readonly id: string

  public readonly commandPrefix: string

  private reconnectAttempts: number = 0

  private ready = false

  private readonly generalQueue = new PQueue({ concurrency: 1 })

  private readonly invisibleSuffix = '\u{000e0000}'

  public readonly api: TwitchAuth
  public readonly packageJSON: any
  public token: Token

  public ircClient: ChatClient

  public readonly msgs: Map<string, Message> = new Map()
  public readonly channels: Map<string, Channel> = new Map()
  public readonly userCooldowns: Map<string, Date> = new Map()

  public readonly handlers: DefaultHandler[] = []

  public readonly admins: string[] | undefined
  public readonly headers: { 'user-agent': string }

  constructor (config: TwitchConfig, ws: Ws, api: TwitchAuth, packageJSON: any, logger: Logger) {
    this.api = api
    this.ws = ws

    this.packageJSON = packageJSON

    this.logger = logger

    this.name = config.user.name
    this.id = config.user.id

    this.commandPrefix = config.commandPrefix

    this.admins = config.admins

    this.headers = config.headers

    this.ws.eventEmitter.on('WS.MESSAGE', (data: WsRes) => this.onServerResponse(data))
    this.ws.eventEmitter.on('WS.CLOSED', (data) => this.onServerClosed(data))
  }

  public async onMessage ({ msg, deleted }: Message) {
    if (deleted) {
      return
    }

    const words = msg.messageText.substring(this.commandPrefix.length).split(' ')

    const foundCommand = this.handlers.filter(command => command.prefix.length !== 0)
      .find(command => command.prefix.includes(words[0].toLowerCase()))

    if (foundCommand !== undefined) {
      if (foundCommand.adminOnly &&
        (this.admins === undefined || !this.admins.includes(msg.senderUsername))) {
        return
      }

      void this.generalQueue.add(async () => await foundCommand.onCommand(msg, words.slice(1)))
    }
  }

  public sendMessage (channel: NameAndId, user: NameAndId, message: string) {
    const foundChannel = this.channels.get(channel.id) as Channel

    foundChannel.addInvisibleSuffix = !foundChannel.addInvisibleSuffix // Flip

    this.ircClient.say(channel.name, `@${user.name}, ${message}${(foundChannel.addInvisibleSuffix) ? this.invisibleSuffix : ''}`)
      .catch(error => this.logger.error({ err: error }, 'Twitch.sendMessage()'))
  }

  public async sendWhisper (user: NameAndId, message: string) {
    return await this.ircClient.whisper(user.id, `${message}`)
  }

  public joinChannel ({ id, name }: NameAndId) {
    this.channels.set(id, {
      id,
      name: name,
      cooldown: new Date(),
      userRolls: new Map(),
      addInvisibleSuffix: true,
    })
  }

  public leaveChannel ({ id, name }: NameAndId) {
    this.channels.delete(id)

    this.ircClient.part(name).then(() => this.logger.info(`Twitch.leaveChannel() -> Twitch.PART: ${name}`)).catch(
      error => this.logger.error({ err: error }, 'Twitch.leaveChannel() -> Twitch.PART'))
  }

  public createAndGetUserInstance (msg: PrivmsgMessage, global = false) {
    this.channels.get(msg.channelID)?.userRolls.set(msg.senderUserID, new RollInstance(global))
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

  public async loginToTwitch () {
    this.logger.info('Logging in to Twitch...')
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

    this.ircClient.use(new SlowModeRateLimiter(this.ircClient))
    this.ircClient.use(new PrivmsgMessageRateLimiter(this.ircClient))

    // Re-add/Add Twitch socket events
    this.ircClient.on('372', (msg) => {
      this.logger.info(`Twitch.372: ${msg.ircParameters.join(' ')}`)
    })

    this.ircClient.once('ready', () => {
      this.logger.info('Twitch.READY: Successfully connected to Twitch IRC.')
      this.ready = true
      this.ircClient.removeListener('ready')
    })

    this.ircClient.on('close', (error) => this.onClose(error))

    // Connection errors will trigger close event.
    this.ircClient.on('error', (error) => this.logger.error({ err: error }, 'Twitch.onError()'))

    this.ircClient.on('PRIVMSG', (msg) => void this.prepareMsg(msg))

    this.ircClient.on('CLEARCHAT', (msg) => this.deleteMessage(msg))
    this.ircClient.on('CLEARMSG', (msg) => this.deleteMessage(msg))

    // Finally, connect to Twitch IRC.
    return this.ircClient.connect()
  }

  private async prepareMsg (msg: PrivmsgMessage): Promise<void> {
    if (msg.senderUserID === this.id) {
      return
    }

    // TODO: REFACTOR THIS LATER.
    if (msg.messageText === '!befriendlier') {
      const msgBot = { ...msg }
      msgBot.messageText = '@@bot'

      const hasSetCooldown = this.cooldown(msg)

      if (hasSetCooldown) {
        this.msgs.set(msg.messageID, new Message(msgBot as PrivmsgMessage, this))
      }

      return
    }

    if (!msg.messageText.startsWith(this.commandPrefix)) {
      return
    }

    const hasSetCooldown = this.cooldown(msg)

    if (hasSetCooldown) {
      // Message class has a "clientRef" to "this" so it can call clientRef.onMessage().
      this.msgs.set(msg.messageID, new Message(msg, this))
    }
  }

  private cooldown (msg: PrivmsgMessage) {
    const foundChannel = this.channels.get(msg.channelID)

    const foundUserCooldown = this.userCooldowns.get(msg.senderUserID)

    if (foundUserCooldown === undefined) {
      this.userCooldowns.set(msg.senderUserID, new Date(Date.now() + 15000))
    } else if (foundUserCooldown.getTime() > Date.now()) {
      return false
    }

    if (foundChannel === undefined) {
      this.leaveChannel({ id: msg.channelID, name: msg.channelName })
      return false
    } else if (foundChannel.cooldown.getTime() > Date.now()) {
      return false
    }

    foundChannel.cooldown = new Date(Date.now() + 5000)
    return true
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

  private onServerClosed (data: { type: MessageType, data: string, state: 0 | 2 | 3 }) {
    const responseMessage = (data.state === this.ws.client.CONNECTING)
      ? 'Please wait, service is currently in the process of starting. Try again in a bit!'
      : (data.state === this.ws.client.CLOSING)
        ? 'service is currently shutting down. Check the website for status updates!'
        : 'service is currently down! Check the website for status updates!'

    const res: BASE = JSON.parse(data.data)

    this.sendMessage(res.channelTwitch, res.userTwitch, responseMessage)

    this.removeUserInstance(res)
  }

  private deleteMessage (msg: ClearchatMessage | ClearmsgMessage) {
    if (msg instanceof ClearchatMessage) {
      if (typeof msg.targetUsername === 'string' && msg.targetUsername === this.name) {
        const channelFound =
          [...this.channels].find(([_id, channel]) => channel.name === msg.channelName)?.[1] as Channel

        if (msg.banDuration === undefined) {
          // We've been banned, leave chat.
          // When the bot gets banned, the senderUsername & senderUserID variables must be empty.
          const leaveChat = {
            senderUsername: '', // These will make userTwitch's variables empty strings.
            senderUserID: '', // =/= Same as above.
            channelName: msg.channelName,
            channelID: channelFound.id,
          }

          void this.handlers
            .find(command => command.messageType === MessageType.LEAVECHAT)?.onCommand(leaveChat as PrivmsgMessage)

          return
        }

        this.channels.get(channelFound.id)?.cooldown.setTime(Date.now() + msg.banDuration)
        return
      }
    }
    for (const [, cachedMsg] of this.msgs) {
      const removeMsgBool = (msg instanceof ClearchatMessage)
        ? cachedMsg.msg.channelName === msg.channelName
        : (msg instanceof ClearmsgMessage)
          ? cachedMsg.msg.messageID === msg.targetMessageID
          : false

      if (removeMsgBool) {
        cachedMsg.deleted = true
        clearTimeout(cachedMsg.timer)
      }
    }
  }

  private onClose (error: Error | undefined) {
    this.logger.error({
      err: (error !== undefined)
        ? error
        : { message: 'Closed without any reason.' },
    }, 'Twitch.onClose()')

    this.reconnectAttempts++

    const timeSeconds = (this.reconnectAttempts) > 50 ? 60 : (this.reconnectAttempts + 9)

    this.logger.info(`TWITCH.CLOSE: ATTEMPT #${this.reconnectAttempts}. Reconnecting in ${timeSeconds} seconds...`)

    this.channels.clear()

    this.ready = false

    setTimeout(() => {
      void this.loginToTwitch()
    }, timeSeconds * 1000)
  }
}

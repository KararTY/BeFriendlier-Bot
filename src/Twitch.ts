/* eslint-disable no-void */
import { Logger } from '@adonisjs/logger'
import {
  ChatClient,
  ClearchatMessage,
  ClearmsgMessage,
  NoticeMessage,
  PrivmsgMessage,
  PrivmsgMessageRateLimiter,
  SlowModeRateLimiter,
  WhisperMessage
} from '@kararty/dank-twitch-irc'
import { BASE, Emote, MessageType, More, NameAndId, TwitchAuth } from 'befriendlier-shared'
import PQueue from 'p-queue'
import TwitchConfig from '../config/Twitch'
import pajbotBanphraseCheck from './banphrase'
import DefaultHandler from './Handlers/DefaultHandler'
import LeaveChannelHandler from './Handlers/LeaveChatHandler'
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

interface UserRollInstance {
  channelID: string
  senderUserID: string
  data: UserRollInstanceData
}

interface UserRollInstanceData {
  profile: Profile
  user: User
  type?: More
  lastType?: More
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

class WhMessage {
  public readonly msg: WhisperMessage

  constructor (msg: WhisperMessage, clientRef: any) {
    this.msg = msg

    // Immediately invoke function.
    clientRef.onMessage(this)
  }
}

export interface User {
  name: string
  twitchID: string
  favorite_streamers: User[]
}

export interface Profile {
  enabled: boolean
  bio: string
  favorite_emotes: Emote[]
}

export class RollInstance {
  public lastType?: More
  public type: More
  public global: boolean
  public data: {
    profile: Profile
    user: User
  }

  constructor ({ profile, user, type, lastType }: UserRollInstanceData, global = false) {
    this.data = {
      profile,
      user
    }

    this.global = global
    this.type = type ?? More.NONE
    this.lastType = lastType
  }

  public nextType (): void {
    this.lastType = this.type.toString() as More

    switch (this.type) {
      case More.NONE:
        this.type = More.BIO
        break
      case More.BIO:
        this.type = More.FAVORITESTREAMERS
        break
      case More.FAVORITESTREAMERS:
        this.type = More.BIO
        break
    }
  }
}

const cooldowns = {
  user: 7500,
  channel: 5000,
  whisper: 2500
}

export default class Client {
  private readonly ws: Ws
  private readonly logger: Logger

  public readonly name: string
  public readonly id: string

  public readonly commandPrefix: string

  private reconnectAttempts: number = 0

  private ready = false

  private readonly generalQueue = new PQueue({ concurrency: 1 })

  private readonly invisibleSuffix = ' \u{000e0000}'

  public readonly api: TwitchAuth
  public readonly packageJSON: any
  public token: Token

  public ircClient: ChatClient

  public readonly msgs: Map<string, Message | WhMessage> = new Map()
  public readonly channels: Map<string, Channel> = new Map()
  public readonly userCooldowns: Map<string, Date> = new Map()

  public readonly handlers: DefaultHandler[] = []

  public readonly admins: string[] | undefined
  public readonly headers: { 'user-agent': string }

  constructor (config: TwitchConfig, ws: Ws, api: TwitchAuth, packageJSON: any, logger: Logger) {
    this.name = config.user.name
    this.id = config.user.id
    this.commandPrefix = config.commandPrefix
    this.admins = config.admins
    this.headers = config.headers

    this.ws = ws

    this.api = api

    this.packageJSON = packageJSON

    this.logger = logger

    this.ws.eventEmitter.on('WS.MESSAGE', (data: WsRes) => this.onServerResponse(data))
    this.ws.eventEmitter.on('WS.CLOSED', (data) => this.onServerClosed(data))
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

  public async loginToTwitch (): Promise<void> {
    this.logger.info('Logging in to Twitch...')
    // We clean off all events, just for precautionary measures.
    if (this.ircClient !== undefined) {
      this.ircClient.removeAllListeners()
      this.ircClient.close();
      (this.ircClient as any) = undefined
    }

    // Relogin to chat!
    this.ircClient = new ChatClient({
      password: `oauth:${this.token.superSecret}`,
      rateLimits: 'default',
      username: this.name,
      connection: {
        type: 'websocket',
        secure: true
      }
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
    this.ircClient.on('WHISPER', (msg) => void this.prepareWhisperMsg(msg))

    this.ircClient.on('CLEARCHAT', (msg) => this.deleteMessage(msg))
    this.ircClient.on('CLEARMSG', (msg) => this.deleteMessage(msg))

    this.ircClient.on('NOTICE', (msg) => void this.noticeMsg(msg))

    // Finally, connect to Twitch IRC.
    return await this.ircClient.connect()
  }

  public async sendMessage (channel: NameAndId, user: NameAndId, message: string, messageID?: string): Promise<void> {
    const foundChannel = this.channels.get(channel.id) as Channel

    const filteredMessage = this.filterMsg(message)

    const checkMessages = await pajbotBanphraseCheck(foundChannel.name, filteredMessage)

    if (checkMessages.length > 0) {
      checkMessages.push('Ignoring you for a minute.')
      message = checkMessages.join(' ')
      this.userCooldowns.set(user.id, new Date(Date.now() + 60000))
      // this.removeUserInstance({ channelTwitch: channel, userTwitch: user })
    }

    foundChannel.addInvisibleSuffix = !foundChannel.addInvisibleSuffix // Flip

    const replyStr = `${message}${(foundChannel.addInvisibleSuffix) ? this.invisibleSuffix : ''}`

    let promise: Promise<void>
    if (messageID !== undefined) promise = this.ircClient.reply(channel.name, messageID, replyStr)
    else promise = this.ircClient.say(channel.name, `@${user.name}, ${replyStr}`)

    promise
      .catch(error => this.logger.error({ err: error }, `Twitch.sendMessage(${(messageID !== undefined) ? 'messageID' : ''})`))
  }

  public async sendWhisper (user: NameAndId, message: string): Promise<void> {
    return await this.ircClient.whisper(user.name, `${message}`)
  }

  public joinChannel ({ id, name }: NameAndId): void {
    this.channels.set(id, {
      id,
      name: name,
      cooldown: new Date(),
      userRolls: new Map(),
      addInvisibleSuffix: true
    })
  }

  public leaveChannel ({ id, name }: NameAndId): void {
    this.channels.delete(id)

    this.ircClient.part(name).then(() => this.logger.info(`Twitch.leaveChannel() -> Twitch.PART: ${name}`)).catch(
      error => this.logger.error({ err: error }, 'Twitch.leaveChannel() -> Twitch.PART'))
  }

  public setUserInstance (
    { channelID, senderUserID, data }: UserRollInstance,
    global = false): RollInstance {
    this.channels.get(channelID)?.userRolls.set(senderUserID, new RollInstance(data, global))
    return this.getUserInstance({ channelID, senderUserID }) as RollInstance
  }

  public getUserInstance (msg: { channelID: string, senderUserID: string }): RollInstance | undefined {
    return this.channels.get(msg.channelID)?.userRolls.get(msg.senderUserID)
  }

  public removeUserInstance ({ channelTwitch, userTwitch }: BASE): void {
    const userInstance = this.channels.get(channelTwitch.id)?.userRolls.get(userTwitch.id)

    if (userInstance !== undefined) {
      this.channels.get(channelTwitch.id)?.userRolls.delete(userTwitch.id)
    }
  }

  public async onMessage (m: Message | WhMessage): Promise<void> {
    if (m instanceof Message && m.deleted) {
      return
    }

    const words = m.msg.messageText.substring(this.commandPrefix.length).split(/ +/gm)

    const foundCommand = this.handlers.filter(command => command.prefix.length !== 0)
      .find(command => command.prefix.includes(words[0].toLowerCase()))

    if (foundCommand !== undefined) {
      if (foundCommand.adminOnly &&
        (this.admins === undefined || !this.admins.includes(m.msg.senderUsername))) {
        return
      }

      if (m instanceof WhMessage) {
        void this.generalQueue.add(async () => await foundCommand.onWhisperCommand(m.msg, words.slice(1)))
      } else void this.generalQueue.add(async () => await foundCommand.onCommand(m.msg, words.slice(1)))
    }
  }

  private async prepareMsg (msg: PrivmsgMessage): Promise<void> {
    if (msg.senderUserID === this.id) {
      return
    }

    const filteredMsg = this.filterMsg(msg.messageText)

    const foundInstantCommand = this.handlers
      .find(command => command.prefix.includes(filteredMsg) && command.instantResponse)

    if (foundInstantCommand !== undefined) {
      await foundInstantCommand.onCommand({ ...msg, messageText: filteredMsg } as unknown as PrivmsgMessage)
      return
    }

    // TODO: REFACTOR THIS LATER.
    if (msg.messageText === `!${this.name}`) {
      const msgBot = { ...msg }
      msgBot.messageText = `${this.commandPrefix}bot`

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
      const m = { ...msg, messageText: filteredMsg } as unknown as PrivmsgMessage
      this.msgs.set(msg.messageID, new Message(m, this))
    }
  }

  private async prepareWhisperMsg (whMsg: WhisperMessage): Promise<void> {
    if (whMsg.senderUserID === this.id) {
      return
    }

    if (!whMsg.messageText.startsWith(this.commandPrefix)) {
      return
    }

    const hasSetCooldown = this.cooldown(whMsg)

    if (hasSetCooldown) {
      const w: WhisperMessage = { ...whMsg, messageText: this.filterMsg(whMsg.messageText) }
      this.msgs.set(whMsg.messageID, new WhMessage(w, this))
    }
  }

  // Remove some characters.
  public filterMsg (messageText: string): string {
    return messageText.normalize().replace(/[\uE000-\uF8FF]+/gu, '').replace(/[\u{000e0000}]/gu, '').trim()
  }

  private cooldown (msg: PrivmsgMessage | WhisperMessage, customCooldown?: number): boolean {
    const isWhisper = msg instanceof WhisperMessage || typeof msg.channelID === 'undefined'
    const dateNow = Date.now()

    const foundChannelCooldown = this.channels.get(isWhisper ? this.id : msg.channelID)
    let foundUserCooldown = this.userCooldowns.get(msg.senderUserID)

    if (foundChannelCooldown === undefined) {
      if (msg instanceof PrivmsgMessage) {
        this.leaveChannel({ id: msg.channelID, name: msg.channelName })
      } else {
        this.logger.error({}, `Twitch.cooldown() -> Could not find "${this.name}" channel in channels array.`)
      }
      return false
    }

    if (foundUserCooldown === undefined) {
      this.userCooldowns.set(msg.senderUserID, new Date(dateNow))
      foundUserCooldown = this.userCooldowns.get(msg.senderUserID) as Date
    }

    const cooldown = (foundChannelCooldown.cooldown.getTime() - dateNow) + (foundUserCooldown.getTime() - dateNow)

    if (cooldown <= 0) {
      foundChannelCooldown.cooldown = new Date(dateNow + (isWhisper ? cooldowns.whisper : cooldowns.channel))
      this.userCooldowns.set(msg.senderUserID, new Date(dateNow + (customCooldown ?? (isWhisper ? cooldowns.whisper : cooldowns.user))))
      return true
    } else return false
  }

  public async noticeMsg (msg: NoticeMessage): Promise<void> {
    const channel =
      [...this.channels].find(([_id, channel]) => channel.name === msg.channelName)

    let name = msg.channelName
    let id = ''

    if (typeof channel !== 'undefined') {
      // Might not always exist in cache, like when we initially join.
      name = channel[1].name
      id = channel[1].id
    }

    switch (msg.messageID) {
      case 'msg_banned':
      case 'tos_banned':
      case 'msg_channel_banned': {
        if (typeof name === 'undefined') {
          this.logger.warn('[NoticeMessage] Unknown user (%s): %s', msg.channelName, JSON.stringify(msg))
          return
        }
        // Unhost channel.
        void (this.handlers.find(command => command.messageType === MessageType.LEAVECHAT) as LeaveChannelHandler).onBanned({ name, id })
        break
      }
      default:
        this.logger.info('[NoticeMessage] %s', msg.messageID)
    }
  }

  private onServerResponse (res: WsRes): void {
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

  private onServerClosed (data: { type: MessageType, data: string, state: 0 | 2 | 3 }): void {
    const responseMessage = (data.state === this.ws.client.CONNECTING)
      ? 'Please wait, service is currently in the process of starting. Try again in a bit!'
      : (data.state === this.ws.client.CLOSING)
          ? 'service is currently shutting down. Check the website for status updates!'
          : 'service is currently down! Check the website for status updates!'

    const res: BASE = JSON.parse(data.data)

    void this.sendMessage(res.channelTwitch, res.userTwitch, responseMessage, res.messageID)

    this.removeUserInstance(res)
  }

  private deleteMessage (msg: ClearchatMessage | ClearmsgMessage): void {
    if (msg instanceof ClearchatMessage) {
      if (typeof msg.targetUsername === 'string' && msg.targetUsername === this.name) {
        let { name, id } =
          [...this.channels].find(([_id, channel]) => channel.name === msg.channelName)?.[1] as Channel

        name = name ?? msg.channelName

        if (msg.banDuration === undefined) {
          void (this.handlers
            .find(command => command.messageType === MessageType.LEAVECHAT) as LeaveChannelHandler).onBanned({ name, id })

          return
        }

        this.channels.get(id)?.cooldown.setTime(Date.now() + msg.banDuration)
        return
      }
    }

    for (const [, cachedMsg] of this.msgs) {
      if (cachedMsg instanceof WhMessage) continue

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

  private onClose (error: Error | undefined): void {
    this.logger.error({
      err: (error !== undefined)
        ? error
        : { message: 'Closed without any reason.' }
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

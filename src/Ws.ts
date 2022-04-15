import { Logger } from '@adonisjs/logger'
import { schema } from '@adonisjs/validator/build/src/Schema'
import { validator } from '@adonisjs/validator/build/src/Validator'
import { MessageType } from 'befriendlier-shared'
import { EventEmitter } from 'events'
import sjp from 'secure-json-parse'
import WS from 'ws'
import WSConfig from '../config/Ws'

export interface WsRes {
  type: MessageType
  data: string | undefined
  timestamp: number
}

export default class Bot {
  public client: WS

  private readonly logger: Logger
  private readonly url: string
  private readonly headers: { 'user-agent': string }

  public eventEmitter: EventEmitter

  private reconnectAttempts: number = 0

  constructor (config: WSConfig, logger: Logger) {
    this.url = config.url
    this.headers = config.headers
    this.logger = logger

    this.eventEmitter = new EventEmitter()
  }

  public connect (): void {
    if (this.client !== undefined) {
      this.client.removeAllListeners()
    }

    this.client = new WS(this.url, { headers: this.headers })

    this.client.on('open', () => this.onOpen())
    this.client.on('message', (data) => this.onMessage(data))
    this.client.on('close', (code, reason) => this.onClose(code, reason))
    this.client.on('ping', (data) => this.onPing(data))
    this.client.on('error', (err) => this.onError(err))
  }

  public sendMessage (type: MessageType, data: string): void {
    if (this.client.readyState === 0 || this.client.readyState > 1) {
      this.eventEmitter.emit('WS.CLOSED', { type, data, state: this.client.readyState })
      return
    }

    this.client.send(this.socketMessage(type, data))
  }

  private onOpen (): void {
    this.logger.info(`Ws.onOpen() ${prettySocketInfo(this.url)}`)
    this.eventEmitter.emit('WS.OPEN')
    this.reconnectAttempts = 0
  }

  private onMessage (data: WS.RawData): void {
    const bufToStr = String(data) // TODO: This is ugly, can't I do it another way?
    this.logger.debug(`Ws.onMessage() ${prettySocketInfo(this.url)}: %O`, bufToStr)

    let json

    try {
      json = sjp.parse(bufToStr, null, { protoAction: 'remove' })
    } catch (error) {
      this.logger.error({ err: error }, 'Ws.onMessage(): Error with parsing websocket data.')
      // Data's not JSON.
      return
    }

    // LOG ERROR ON DATA THAT'S NOT PROPERLY FORMATTED
    validator.validate({
      schema: this.validationSchema,
      data: json,
      messages: {
        type: 'Invalid type.'
      },
      cacheKey: 'websocket'
    }).then(async (res: WsRes) => {
      this.eventEmitter.emit('WS.MESSAGE', res)
    }).catch((error: Error) => {
      this.logger.error({ err: error }, 'Ws.onMessage()')
    })
  }

  private onClose (code: number, reason: Buffer): void {
    const bufToStr = String(reason)
    this.logger.error(`Ws.onClose() ${prettySocketInfo(this.url)}: code: ${code}${bufToStr.length > 0 ? `, reason:\n${bufToStr}` : ''}`)

    this.reconnectAttempts++

    const timeSeconds = this.reconnectAttempts > 50 ? 60 : (this.reconnectAttempts + 9)

    this.logger.info(`Ws.onClose() ${prettySocketInfo(this.url)}: ATTEMPT #${this.reconnectAttempts}. Reconnecting in ${timeSeconds} seconds...`)

    setTimeout(() => {
      this.connect()
    }, timeSeconds * 1000)
  }

  private onPing (data: Buffer): void {
    this.logger.debug(`Ws.onPing() ${prettySocketInfo(this.url)}${data.length > 0 ? `: ${data.toString()}` : ''}`)
  }

  private onError (error: Error): void {
    this.logger.error({ err: error }, `Ws.onError() ${prettySocketInfo(this.url)}`)
  }

  private socketMessage (type: MessageType, data: string): string {
    return JSON.stringify({ type: type, data: data, timestamp: Date.now() })
  }

  private readonly validationSchema = schema.create({
    type: schema.enum(Object.values(MessageType)),
    data: schema.string.optional(),
    timestamp: schema.number()
  })
}

function prettySocketInfo (url: string): string {
  return `[${url}]`
}

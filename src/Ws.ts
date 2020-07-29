// import { MessageType } from 'befriendlier-shared'
import WS from 'ws'

export default class Bot {
  private readonly client: WS

  constructor (url: string, headers: { [key: string]: string }) {
    this.client = new WS(url, { headers })

    this.client.on('open', () => this.onOpen())
    this.client.on('message', (data) => this.onMessage(data))
    this.client.on('close', (code, reason) => this.onClose(code, reason))
    this.client.on('ping', (data) => this.onPing(data))
  }

  private onOpen () {
    console.log('CONNECTED: %s', this.client.url)
  }

  private onMessage (data: WS.Data) {
    console.log(data)
  }

  private onClose (code: number, reason: string) {
    console.error('CLOSE: code: %s, reason:\n%s', code, reason)
  }

  private onPing (data: Buffer) {
    console.log(`PING${data.length > 0 ? `: ${data.toString()}` : '!'}`)
  }
}

import { PrivmsgMessage } from 'dank-twitch-irc'
import fs from 'fs'
import path from 'path'
import fetch from 'got'
import DefaultHandler from './DefaultHandler'

enum Sign {
  AQ = 'aquarius',
  PI = 'pisces',
  T = 'taurus',
  G = 'gemini',
  CAN = 'cancer',
  LE = 'leo',
  V = 'virgo',
  LI = 'libra',
  SC = 'scorpio',
  SA = 'sagittarius',
  CAP = 'capricorn',
}

interface Horoscope {
  sign: Sign
  date: string
  horoscope: string
  nextRequest: string
}

export default class DailyHoroscopeHandler extends DefaultHandler {
  // public messageType = MessageType

  public prefix = ['dailyhoroscope', 'horoscope']

  private horoscope: Horoscope

  public async onCommand (msg: PrivmsgMessage, words: string[]) {
    let horoscopeName = Sign.LE.toString()

    if (words[0] !== undefined) {
      const firstWordLowercase = words[0].toLowerCase()
      horoscopeName =
        Object.values(Sign).map(sign => String(sign)).find(signVal => signVal === firstWordLowercase) !== undefined
          ? firstWordLowercase
          : Sign.LE
    }

    // Load JSON or create it.
    if (this.horoscope === undefined) {
      let fileContent: string
      try {
        // Load JSON
        fileContent = fs.readFileSync(path.join(__dirname, '..', `horoscope_${horoscopeName}.json`), 'utf-8')
      } catch (error) {
        // Create file.
        const response = await this.requestHoroscope(horoscopeName)

        if (response !== null) {
          fileContent = JSON.stringify(response)
        } else {
          this.twitch.sendMessage(msg.channelName, msg.senderUsername, 'no horoscope today! Check back tomorrow?')
          return
        }
      }

      this.horoscope = JSON.parse(fileContent)
    }

    const nextRequest = new Date(this.horoscope.nextRequest).getTime()
    if (Date.now() > nextRequest) {
      // Get new horoscope
      const response = await this.requestHoroscope(horoscopeName)

      if (response !== null) {
        this.horoscope = response
      } else {
        this.twitch.sendMessage(msg.channelName, msg.senderUsername, 'no horoscope today! Check back tomorrow?')
        return
      }
    }

    const message = `${this.horoscope.sign} horoscope for date ${this.horoscope.date}: ${this.horoscope.horoscope}`

    this.twitch.sendMessage(msg.channelName, msg.senderUsername, message)
  }

  private async requestHoroscope (sign: string) {
    try {
      const { body }: any = await fetch.get(`http://ohmanda.com/api/horoscope/${sign}/`, {
        headers: this.twitch.headers,
        responseType: 'json',
      })

      const nextRequest = new Date()
      nextRequest.setDate(new Date().getDate() + 1)
      body.nextRequest = nextRequest.toUTCString()

      fs.writeFileSync(path.join(__dirname, '..', `horoscope_${sign}.json`), JSON.stringify(body))

      return body as Horoscope
    } catch (error) {
      this.logger.error({ err: error }, 'DailyHoroscopeHandler.requestHoroscope()')
      return null
    }
  }
  // public onServerResponse (res) {}
}

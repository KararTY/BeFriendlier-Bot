import { PrivmsgMessage } from '@kararty/dank-twitch-irc'
import fs from 'fs'
import fetch from 'got'
import os from 'os'
import path from 'path'
import BioHandler from './BioHandler'
import DefaultHandler from './DefaultHandler'

enum Sign {
  AQ = 'aquarius',
  PI = 'pisces',
  AR = 'aries',
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

  public prefix = ['horoscope', 'dailyhoroscope']

  public helpText = (): string => {
    const signs = Object.values(Sign).map(sign => String(sign))
    return this.i18n(this.messagesText.helpText.horoscope.replace('%s', signs.join(', ')))
  }

  private readonly horoscopes: Horoscope[] = []

  private readonly horoscopesDirPath: string = path.join(os.homedir(), 'horoscopes')

  public async onCommand (msg: PrivmsgMessage, words: string[]): Promise<void> {
    const responseMessage = this.getNameAndIds(msg)

    let horoscopeName = this.randomSign().toString()

    if (words[0] !== undefined) {
      const firstWordLowercase = words[0].toLowerCase()
      horoscopeName =
        Object.values(Sign).map(sign => String(sign)).find(signVal => signVal === firstWordLowercase) !== undefined
          ? firstWordLowercase
          : horoscopeName
    }

    let horoscope = this.horoscopes.find(horoscope => horoscope.sign === horoscopeName)

    // Load JSON or create it.
    if (horoscope === undefined) {
      let fileContent: string
      try {
        // Load JSON
        fileContent = fs.readFileSync(path.join(this.horoscopesDirPath.toString(), `horoscope_${horoscopeName}.json`), 'utf-8')
      } catch (error) {
        // Create file.
        const response = await this.requestHoroscope(horoscopeName)

        if (response !== null) {
          fileContent = JSON.stringify(response)
        } else {
          void this.twitch.sendMessage(
            responseMessage.channelTwitch,
            responseMessage.userTwitch,
            this.i18n(this.messagesText.noHoroscope)
          )
          return
        }
      }

      this.horoscopes.push(JSON.parse(fileContent))
      horoscope = this.horoscopes.find(horoscope => horoscope.sign === horoscopeName) as Horoscope
    }

    const nextRequest = new Date(horoscope.nextRequest).getTime()
    if (Date.now() > nextRequest) {
      // Get new horoscope
      const response = await this.requestHoroscope(horoscopeName)

      if (response !== null) {
        horoscope = response
      } else {
        void this.twitch.sendMessage(
          responseMessage.channelTwitch,
          responseMessage.userTwitch,
          this.i18n(this.messagesText.noHoroscope)
        )
        return
      }
    }

    const message = BioHandler.shortenText(`${horoscope.sign} horoscope for date ${horoscope.date}: ${horoscope.horoscope.split('. ')[0]}`, 192)

    void this.twitch.sendMessage(responseMessage.channelTwitch, responseMessage.userTwitch, message)
  }

  private async requestHoroscope (sign: string): Promise<null | Horoscope> {
    try {
      const { body }: any = await fetch.get(`https://ohmanda.com/api/horoscope/${sign}/`, {
        headers: this.twitch.headers,
        responseType: 'json'
      })

      const nextRequest = new Date()
      nextRequest.setDate(new Date().getDate() + 1)
      body.nextRequest = nextRequest.toUTCString()

      if (!fs.existsSync(this.horoscopesDirPath)) {
        fs.mkdirSync(this.horoscopesDirPath, { recursive: true })
      }

      fs.writeFileSync(path.join(this.horoscopesDirPath.toString(), `horoscope_${sign}.json`), JSON.stringify(body), 'utf-8')

      return body as Horoscope
    } catch (error) {
      this.logger.error({ err: error }, 'DailyHoroscopeHandler.requestHoroscope()')
      return null
    }
  }

  private randomSign (): Sign {
    const arr = Object.values(Sign)
    return arr[Math.floor(Math.random() * arr.length)]
  }

  // public async onServerResponse (res) {}
}

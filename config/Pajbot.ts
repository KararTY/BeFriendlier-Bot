export default class PajbotConfig {
  public channels: [] = []
  public headers: {
    'user-agent': string
    'content-type': string
  }

  public enabled: boolean

  constructor () {
    /**
     * Enable Pajbot checking.
     */
    this.enabled = true

    /**
     * Custom pajbot channels - If length === 0 / unset, gets default values.
     * [See default values here.](https://github.com/KararTY/BeFriendlier-Shared/blob/master/src/pajbotList.ts)
     */
    this.channels = []

    /**
     * HTTP request headers.
     */
    this.headers = {
      'content-type': 'application/json',
      'user-agent': 'befriendlierbot (https://github.com/kararty/befriendlier-bot)'
    }
  }
}

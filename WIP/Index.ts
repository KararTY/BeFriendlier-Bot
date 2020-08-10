/**
 * Needs https://github.com/uNetworking/uWebSockets/issues/791 before there can be further progress on this.
 * All code below is stalled & work-in-progress until above is (eventually, maybe never) resolved/paid for.
 */

// import { } from 'befriendlier-shared'
import uWS, {
  HttpRequest,
  HttpResponse,
  TemplatedApp,
  us_listen_socket,
  us_socket_context_t,
  WebSocket,
} from 'uWebSockets.js'

class Bot {
  private readonly app: TemplatedApp

  constructor (port: number) {
    this.app = uWS.App()

    // Add WS to app.
    this.appendWSHandlers()

    // Add HTTP to app.
    this.appendHTTPHandlers()

    // Listen to connections.
    this.app.listen(port, (ls: us_listen_socket | undefined) => {
      if (typeof ls !== 'undefined') {
        console.log(`Listening on port ${port}.`)
      } else {
        console.error(`Cannot listen to port ${port}.`)
      }
    })
  }

  private appendWSHandlers () {
    this.app.ws('', {
      idleTimeout: 30,
      maxBackpressure: 1024,
      maxPayloadLength: 512,
      compression: uWS.DEDICATED_COMPRESSOR_3KB,

      upgrade: this.upgradeBehaviour,
      open: this.openBehaviour,
      message: this.messageBehaviour,
    })
  }

  private appendHTTPHandlers () {
    this.app.get('/*', (res, req) => {
      /* It does Http as well */
      res.writeStatus('200 OK').writeHeader('IsExample', 'Yes').end('Hello there!')
    })
  }

  private upgradeBehaviour (res: HttpResponse, req: HttpRequest, context: us_socket_context_t) {
    console.log(`An Http connection wants to become WebSocket, URL: ${req.getUrl()}!`)

    /* This immediately calls open handler, you must not use res after this call */
    res.upgrade({
      url: req.getUrl(),
    },

    /* Spell these correctly */
    req.getHeader('sec-websocket-key'),
    req.getHeader('sec-websocket-protocol'),
    req.getHeader('sec-websocket-extensions'),
    context)
  }

  private openBehaviour (ws: WebSocket) {
    console.log(`A WebSocket connected with URL: ${String(ws.url)}`)

    ws.send(JSON.stringify({ type: 'GC' }))
  }

  private messageBehaviour (ws: WebSocket, message: ArrayBuffer, isBinary: boolean) {
    console.log(ws, message, isBinary)
  }
}

(() => new Bot(9001))()

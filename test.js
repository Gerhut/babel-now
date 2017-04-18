/* eslint-env mocha */

const { createServer } = require('http')
const { URL } = require('url')
const Koa = require('koa')
const superagent = require('superagent')
const babelNow = require('.')

const app = new Koa()
const server = createServer(app.callback())
const url = new URL('http://127.0.0.1/')

before(async () => {
  app.use(babelNow)
  server.listen()

  await new Promise((resolve, reject) => {
    server.once('listening', resolve)
    server.once('error', reject)
  })

  url.port = server.address().port
})

after(() => {
  server.close()
  return new Promise((resolve, reject) => {
    server.once('close', resolve)
    server.once('error', reject)
  })
})

describe('babel-now', () => {
  it('should serve index.html', async () => {
    const res = await superagent(url).buffer()
    res.type.should.equal('text/html')
  })

  it('should serve example.js', async () => {
    const res = await superagent(new URL('/example.js', url)).buffer()
    res.type.should.equal('application/javascript')
  })

  it('should transpile javascript files', async () => {
    const codeUrl = new URL('/example.js', url)
    const rawRes = await superagent(codeUrl).buffer()
    const compiledRes = await superagent(new URL(`/${codeUrl}`, url)).buffer()

    compiledRes.type.should.equal(rawRes.type)
    compiledRes.text.should.not.equal(rawRes.text)
  })
})

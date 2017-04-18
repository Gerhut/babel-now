const send = require('koa-send')
const superagent = require('superagent')
const useragent = require('useragent')
const babel = require('babel-core')

module.exports = async context => {
  context.assert(context.method === 'GET', 405)

  const url = context.url.replace(/^\//, '')
  if (url === '') {
    return send(context, 'index.html', { root: __dirname })
  } else if (url === 'example.js') {
    return send(context, 'example.js', { root: __dirname })
  }
  context.assert(/^https?:\/\//i.test(url), 400, 'Invalid URL.')
  const raw = await superagent(url).buffer()

  const agent = useragent.lookup(context.get('User-Agent'))
  const version = Number(`${agent.major}.${agent.minor}`)
  const targets = Object.create(null)
  switch (agent.family) {
    case 'Chrome': targets.chrome = version; break
    case 'Edge': targets.edge = version; break
    case 'Firefox': targets.firefox = version; break
    case 'Safari': targets.safari = version; break
    case 'Android': targets.android = version; break
    case 'IE': targets.ie = version; break
    case 'Mobile Safari': targets.ios = version; break
    case 'Opera': targets.opera = version; break
  }

  try {
    const compiled = babel.transform(raw.text, {
      presets: [
        ['env', {
          targets
        }]
      ]
    }).code

    context.type = 'js'
    context.body = compiled
  } catch (err) {
    context.status = 502
    context.body = err.message
  }
}

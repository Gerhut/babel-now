const Koa = require('koa')
const app = new Koa()

app.use(require('.'))
app.listen(process.env.PORT || 3000)

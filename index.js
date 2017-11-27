const bodyParser = require('body-parser')
const path = require('path')
const express = require('express')
const fileUpload = require('express-fileupload')
const autoCommentingRoutes = require('./routes/autoCommenting')
const PORT = 7070
let app = express()
const server = require('http').createServer(app)
const io = require('socket.io').listen(server)

app.use(fileUpload())
app.use(express.static(path.join(process.cwd(), 'public')))

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/', autoCommentingRoutes)

server.listen(process.env.PORT || PORT)

io.sockets.on('connection', (socket) => {

  console.log('Socket connected.')

  io.sockets.emit('serviceStarted')

  socket.on('disconnect', (data) => {
    console.log('Socket disconnected.')
  })

  socket.on('fetch keywords', (data) => {
    io.sockets.emit('loadTableData', { keywords: data.keywords })
  })

  socket.on('updateLoggedUserInfo', (data) => {
    io.sockets.emit('updateLoggedUserInfo', data)
  })

  socket.on('request data', () => {
    io.sockets.emit('request data')
  })

  socket.on('GetTrending Completed', () => {
    io.sockets.emit('GetTrendingCompleted')
  })

})
// app.listen(PORT, () => {
//   console.log(`app started http://localhost:${PORT}`)
// })

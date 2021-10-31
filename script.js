// import { io } from '../Server/node_modules/socket.io-client'
// const io = require('socket.io-client')
// const { io } = require('socket.io-client')

const socket = io('http://localhost:3031')

socket.on('connect', () => {
    console.log('connected to server!')
})

function displayMsg(msg) {
    const div = document.createElement('div')
    div.textContent = msgdocument.getElementById('message-container').append(div)
}
console.log('Current directory: ' + process.cwd())

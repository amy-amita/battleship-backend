import { v4 as uuidv4 } from 'uuid'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import User from './models/userSchema'
import Room from './models/roomSchema'

//------------------------------------------- Connect to Database -------------------------------------------------//

mongoose.connect(
    'mongodb+srv://testuser:battleship@cluster0.w9j5l.mongodb.net/battleship?retryWrites=true&w=majority'
)

//-----------------------------------------------------------------------------------------------------------------//

const io = new Server(3031)

io.on('connection', (socket) => {
    console.log(socket.id)

    // open page
    socket.on('userData', async (username: string, avatarName: string) => {
        let checkUsername = true
        console.log(username)
        const user = new User({ username, socketId: socket.id, avatarName })
        const valid = await User.findOne({ username })
        if (valid == null) {
            await user.save()
            socket.emit('checkUsername', checkUsername, username)
        } else {
            checkUsername = false
            socket.emit('checkUsername', checkUsername, username)
        }
    })

    // create game
    socket.on(
        'createGame',
        async (
            username: string
            // cb: string
        ) => {
            const room = new Room({
                roomId: uuidv4(),
                pName: { p1: username, p2: '' },
                pSocket: { p1: socket.id, p2: '' },
                pScore: { p1: 0, p2: 0 },
                pWinRound: { p1: 0, p2: 0 },
                pShipPos: { p1: '', p2: '' },
                pHitPos: { p1: '', p2: '' },
                pMissPos: { p1: '', p2: '' },
                playerReady: { p1: false, p2: false }, //0 = not ready, 1 = ready
                nextTurn: '',
            })
            await room.save()
            // const tmp = await Room.findOne({ 'pName.p1': username })
            // console.log(tmp)
            // cb(`Room ID : ${room.roomId}`)
        }
    )

    //join game
    socket.on(
        'joinGame',
        async (
            roomId: string,
            username: string
            // cb: any
        ) => {
            const room = await Room.findOne({ roomId })
            if (room) {
                // console.log(room.pName.p1);
                if (room.pName.p2 === '') {
                    const filter = { roomId }
                    const update = { 'pName.p2': username }
                    await Room.updateOne(filter, update)
                    // cb(`Joined ${roomId}`)
                } else {
                    // cb(`This room is full!`)
                }
            } else {
                // cb('Room does not exist (join)')
            }
        }
    )

    socket.on('findRoom', async () => {
        const count = await io.engine.clientsCount
        socket.emit('onlineNum', count)
        let rooms = await Room.find()
        socket.emit('findRoom', rooms)
    })

    // pre-game w/ roomId
    socket.on(
        'ready',
        async (
            roomId: string,
            username: string,
            shipPos: string
            // cb: any
        ) => {
            let room = await Room.findOne({ roomId })
            if (room) {
                let update
                if (room.pName.p1 === username) {
                    update = [
                        { 'pShipPos.p1': shipPos },
                        { 'playerReady.p1': true },
                    ]
                    socket.emit('ready', room.pName.p2)
                } else if (room.pName.p2 === username) {
                    update = [
                        { 'pShipPos.p2': shipPos },
                        { 'playerReady.p2': true },
                    ]
                    socket.emit('ready', room.pName.p1)
                }
                await Room.updateOne({ roomId }, update)
                // cb(`${username} is ready`);
            } else {
                socket.emit('Room does not exist (ready)')
            }
            room = await Room.findOne({ roomId })
            if (room.playerReady.p1 === true && room.playerReady.p2 === true) {
                let update
                if (room.pWinRound.p1 === 0 && room.pWinRound.p2 === 0) {
                    if (Math.floor(Math.random() * 2) === 0) {
                        update = { nextTurn: 1 }
                        socket.emit('checkReady', 'player1')
                    } else {
                        update = { nextTurn: 2 }
                        socket.emit('checkReady', 'player2')
                    }
                    await Room.updateOne({ roomId }, update)
                } else {
                    if (room.lastWinner === room.pName.p1) {
                        update = { nextTurn: 1 }
                        socket.emit('checkReady', 'player1')
                    } else {
                        update = { nextTurn: 2 }
                        socket.emit('checkReady', 'player2')
                    }
                }
                await Room.updateOne({ roomId }, update)
            } else {
                socket.emit('checkReady', 'Other player is not ready')
            }
        }
    )

    //attack phase w/ roomId
    socket.on(
        'attack',
        async (
            roomId: string,
            username: string,
            shootPos: string
            // cb: any
        ) => {
            const room = await Room.findOne({ roomId })
            if (room) {
                let update
                if (room.pName.p1 === username) {
                    await room.updateOne({ nextTurn: room.pSocket.p2 })
                    const selfSocketId = room.pSocket.p1
                    const otherSocketId = room.pSocket.p2
                    if (room.pShipPos.p2.includes(shootPos)) {
                        update = { 'pHitPos.p1': room.pHitPos.p1 + shootPos }
                        socket.to(selfSocketId).emit('attack', 'Hit', shootPos)
                        socket
                            .to(otherSocketId)
                            .emit('attacked', 'Hit', shootPos)
                        // cb(`Hit!`)
                    } else {
                        update = { 'pMissPos.p1': room.pMissPos.p1 + shootPos }
                        socket
                            .to(selfSocketId)
                            .emit('attack', 'Missed', shootPos)
                        socket
                            .to(otherSocketId)
                            .emit('attacked', 'Missed', shootPos)
                        // cb(`Missed`)
                    }
                } else if (room.pName.p2 === username) {
                    await room.updateOne({ nextTurn: room.pSocket.p1 })
                    const selfSocketId = room.pSocket.p2
                    const otherSocketId = room.pSocket.p1
                    if (room.pShipPos.p1.includes(shootPos)) {
                        update = { 'pHitPos.p2': room.pHitPos.p2 + shootPos }
                        socket.to(selfSocketId).emit('attack', 'Hit', shootPos)
                        socket
                            .to(otherSocketId)
                            .emit('attacked', 'Hit', shootPos)
                        // cb(`Hit!`)
                    } else {
                        update = { 'pMissPos.p2': room.pMissPos.p2 + shootPos }
                        socket
                            .to(selfSocketId)
                            .emit('attack', 'Missed', shootPos)
                        socket
                            .to(otherSocketId)
                            .emit('attacked', 'Missed', shootPos)
                        // cb(`Missed`)
                    }
                }
                await Room.updateOne({ roomId }, update)
            } else {
                socket.emit('Room does not exist (attack)')
            }
        }
    )

    socket.on('disconnect', () => {
        console.log('Disconnected!')
    })
})

console.log('Server Started!')

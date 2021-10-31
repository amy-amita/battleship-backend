import { v4 as uuidv4 } from 'uuid'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import User from './models/userSchema'
import Room from './models/roomSchema'
import SwearWord from './models/swearWordSchema'
import cors from 'cors'

//------------------------------------------- Connect to Database -------------------------------------------------//

mongoose.connect('mongodb+srv://testuser:battleship@cluster0.w9j5l.mongodb.net/battleship?retryWrites=true&w=majority')

//-----------------------------------------------------------------------------------------------------------------//

const io = new Server(3031, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
})

let timeoutIds: any = {}
let startTimeMS: any = {}
let remainingTimeout: any = {}

io.on('connection', (socket) => {
    console.log(`socket id: ${socket.id}`)

    //admin
    socket.on('reset', async (roomId: string, password: string) => {
        if (password === 'iamadmin') {
            const room = await Room.findOne({ roomId })
            const update = {
                'pScore.p1': 0,
                'pScore.p2': 0,
                'pShipPos.p1': '',
                'pShipPos.p2': '',
                'pHitPos.p1': '',
                'pHitPos.p2': '',
                'pMissPos.p1': '',
                'pMissPos.p2': '',
                'pReady.p1': false,
                'pReady.p2': false,
                nextTurn: '',
            }
            await Room.updateOne({ roomId }, update)
            io.to(socket.id).to(room.pSocket.p1).to(room.pSocket.p2).emit('checkReset', true)
            console.log('reset successful!')
        } else {
            socket.emit('checkReset', false)
            console.log('wrong password!')
        }
    })

    // open page
    socket.on('userData', async (username: string, avatarName: string) => {
        console.log(`username=${username}`)

        const user = await User.findOne({ username })
        if (user == null) {
            const newUser = new User({
                username,
                socketId: socket.id,
                avatarName,
            })
            await newUser.save()
            socket.emit('checkUsername', true, username)
        } else {
            socket.emit('checkUsername', false, username)
        }
    })

    // create game
    socket.on('createGame', async (username: string, roundTime: number, round: number, roomStatus: string) => {
        // console.log(`name: ${username}, time: ${roundTime}, round ${round}, status: ${roomStatus}`)
        const roomId = uuidv4()
        const room = new Room({
            roomId,
            pName: { p1: username, p2: '' },
            pSocket: { p1: socket.id, p2: '' },
            pScore: { p1: 0, p2: 0 },
            pWinRound: { p1: 0, p2: 0 },
            pShipPos: { p1: '', p2: '' },
            pHitPos: { p1: '', p2: '' },
            pMissPos: { p1: '', p2: '' },
            pReady: { p1: false, p2: false },
            nextTurn: '',
            lastWinner: '',
            timer: roundTime * 1000,
            round: round,
            roundCount: 0,
            roomStatus: roomStatus,
        })
        await room.save()
        socket.emit('roomCode', roomId)
    })

    //join game
    socket.on('joinGame', async (roomId: string, username: string) => {
        const room = await Room.findOne({ roomId })
        if (room) {
            // console.log(room.pName.p1);
            if (room.pName.p2 === '') {
                const filter = { roomId }
                const update = {
                    'pName.p2': username,
                    'pSocket.p2': socket.id,
                }
                await Room.updateOne(filter, update)
                io.to(room.pSocket.p1).emit('joinGameCreate', true, roomId)
                io.to(socket.id).emit('joinGameJoin', true, roomId)
                console.log(`Joined ${roomId}`)
            } else {
                io.to(socket.id).emit('joinGameJoin', false, roomId, 0)
                console.log('This room is full!')
            }
        } else {
            io.to(socket.id).emit('joinGameJoin', false, roomId, 1)
            console.log('Room does not exist (join)')
        }
    })

    socket.on('findRoom', async () => {
        const count = await io.engine.clientsCount
        // console.log(typeof(count));
        // console.log(`online player: ${count}`);
        socket.emit('onlineNum', count)
        let rooms = await Room.find({ roomStatus: 'public', 'pName.p2': '' }, '-_id pName.p1 roomId').exec()
        // const names = rooms.map((room: any) => room['pName']['p1'])
        // console.log(rooms)
        socket.emit('findRoom', JSON.stringify(rooms))
    })

    // pre-game w/ roomId
    socket.on('ready', async (roomId: string, username: string, shipPos: string) => {
        let room = await Room.findOne({ roomId })

        // console.log(room);
        if (room) {
            if (room.pName.p1 === username) {
                await Room.updateOne({ roomId }, { 'pShipPos.p1': shipPos, 'pReady.p1': true })
                //parameter = opponent's name, roundCount, round
                socket.emit('ready', room.pName.p2, room.roundCount, room.round)
            } else if (room.pName.p2 === username) {
                await Room.updateOne({ roomId }, { 'pShipPos.p2': shipPos, 'pReady.p2': true })
                socket.emit('ready', room.pName.p1, room.roundCount, room.round)
            }
        } else {
            console.log('room not ready 01')
            socket.emit('Room does not exist (ready)')
        }

        room = await Room.findOne({ roomId })
        if (room) {
            if (room.pReady.p1 === true && room.pReady.p2 === true) {
                if (room.pWinRound.p1 === 0 && room.pWinRound.p2 === 0) {
                    if (Math.floor(Math.random() * 2) === 0) {
                        //parameter = player who begins, timer
                        io.to(room.pSocket.p1).to(room.pSocket.p2).emit('checkReady', room.pName.p1, room.timer)
                        const timeOutId = setTimeout(timeout, room.timer, room.pSocket.p1, room.pSocket.p2, 2, roomId)
                        startTimeMS[roomId] = Date.now()
                        timeoutIds[roomId] = timeOutId
                    } else {
                        io.to(room.pSocket.p1).to(room.pSocket.p2).emit('checkReady', room.pName.p2, room.timer)
                        const timeOutId = setTimeout(timeout, room.timer, room.pSocket.p1, room.pSocket.p2, 1, roomId)
                        startTimeMS[roomId] = Date.now()
                        timeoutIds[roomId] = timeOutId
                    }
                } else {
                    if (room.lastWinner === room.pName.p1) {
                        io.to(room.pSocket.p1).to(room.pSocket.p2).emit('checkReady', room.pName.p1, room.timer)
                        const timeOutId = setTimeout(timeout, room.timer, room.pSocket.p1, room.pSocket.p2, 2, roomId)
                        startTimeMS[roomId] = Date.now()
                        timeoutIds[roomId] = timeOutId
                    } else {
                        io.to(room.pSocket.p1).to(room.pSocket.p2).emit('checkReady', room.pName.p2, room.timer)
                        const timeOutId = setTimeout(timeout, room.timer, room.pSocket.p1, room.pSocket.p2, 1, roomId)
                        startTimeMS[roomId] = Date.now()
                        timeoutIds[roomId] = timeOutId
                    }
                }
            } else {
                console.log('Waiting for another player')
                socket.emit('Waiting for another player (ready)')
            }
        } else {
            console.log('room not exist 02')
        }
    })

    //attack phase w/ roomId
    socket.on('attack', async (roomId: string, username: string, shootPos: string) => {
        const room = await Room.findOne({ roomId })
        clearTimeout(timeoutIds[roomId])
        startTimeMS[roomId] = 0

        if (room) {
            if (room.pName.p1 === username) {
                const selfSocketId = room.pSocket.p1
                const otherSocketId = room.pSocket.p2
                if (room.pShipPos.p2.includes(shootPos)) {
                    const p1NewScore = room.pScore.p1 + 1
                    console.log(`p1 score : ${p1NewScore}`)

                    io.to(selfSocketId).emit('attack', 'Hit', shootPos, room.pName.p1, p1NewScore)
                    io.to(otherSocketId).emit('attacked', 'Hit', shootPos, room.pName.p1, p1NewScore)

                    const timeOutId = setTimeout(timeout, room.timer, room.pSocket.p1, room.pSocket.p2, 2, roomId)
                    startTimeMS[roomId] = Date.now()
                    timeoutIds[roomId] = timeOutId

                    await Room.updateOne(
                        { roomId },
                        {
                            'pHitPos.p1': (room.pHitPos.p1 + ',' + shootPos).replace(/^,|,$/g, ''),
                            'pScore.p1': p1NewScore,
                        }
                    )
                } else {
                    io.to(selfSocketId).emit('attack', 'Missed', shootPos, room.pName.p2, room.pScore.p1)
                    io.to(otherSocketId).emit('attacked', 'Missed', shootPos, room.pName.p2, room.pScore.p1)

                    const timeOutId = setTimeout(timeout, room.timer, room.pSocket.p1, room.pSocket.p2, 1, roomId)
                    startTimeMS[roomId] = Date.now()
                    timeoutIds[roomId] = timeOutId

                    await Room.updateOne(
                        { roomId },
                        {
                            'pMissPos.p1': (room.pMissPos.p1 + ',' + shootPos).replace(/^,|,$/g, ''),
                        }
                    )
                }
            } else if (room.pName.p2 === username) {
                const selfSocketId = room.pSocket.p2
                const otherSocketId = room.pSocket.p1
                if (room.pShipPos.p1.includes(shootPos)) {
                    const p2NewScore = room.pScore.p2 + 1
                    console.log(`p2 score : ${p2NewScore}`)

                    io.to(selfSocketId).emit('attack', 'Hit', shootPos, room.pName.p2, p2NewScore)
                    io.to(otherSocketId).emit('attacked', 'Hit', shootPos, room.pName.p2, p2NewScore)

                    const timeOutId = setTimeout(timeout, room.timer, room.pSocket.p1, room.pSocket.p2, 1, roomId)
                    startTimeMS[roomId] = Date.now()
                    timeoutIds[roomId] = timeOutId

                    await Room.updateOne(
                        { roomId },
                        {
                            'pHitPos.p2': (room.pHitPos.p2 + ',' + shootPos).replace(/^,|,$/g, ''),
                            'pScore.p2': p2NewScore,
                        }
                    )
                } else {
                    io.to(selfSocketId).emit('attack', 'Missed', shootPos, room.pName.p1, room.pScore.p2)
                    io.to(otherSocketId).emit('attacked', 'Missed', shootPos, room.pName.p1, room.pScore.p2)

                    const timeOutId = setTimeout(timeout, room.timer, room.pSocket.p1, room.pSocket.p2, 2, roomId)
                    startTimeMS[roomId] = Date.now()
                    timeoutIds[roomId] = timeOutId

                    await Room.updateOne(
                        { roomId },
                        {
                            'pMissPos.p2': (room.pMissPos.p2 + ',' + shootPos).replace(/^,|,$/g, ''),
                        }
                    )
                }
            }
            const updatedRoom = await Room.findOne({ roomId })
            const p1HitPos = updatedRoom.pHitPos.p1.split(',')
            const p2HitPos = updatedRoom.pHitPos.p2.split(',')
            let { pSocket, pName, round, roundCount, pWinRound } = updatedRoom
            // console.log(p2HitPos, p2HitPos.length)
            if (p1HitPos.length == 16 || p2HitPos.length == 16) {
                roundCount++
                if (p1HitPos.length == 16) {
                    pWinRound.p1++
                    io.to(pSocket.p1).emit('gameEnds', pName.p1, pWinRound.p1, pWinRound.p2, roundCount, round)
                    io.to(pSocket.p2).emit('gameEnds', pName.p1, pWinRound.p2, pWinRound.p1, roundCount, round)
                    console.log(`p1 won, round: ${roundCount}/${round}`)
                    await Room.updateOne(
                        { roomId },
                        { lastWinner: pName.p1, 'pWinRound.p1': pWinRound.p1, roundCount: roundCount }
                    )
                } else if (p2HitPos.length == 16) {
                    pWinRound.p2++
                    io.to(pSocket.p1).emit('gameEnds', pName.p2, pWinRound.p1, pWinRound.p2, roundCount, round)
                    io.to(pSocket.p2).emit('gameEnds', pName.p2, pWinRound.p2, pWinRound.p1, roundCount, round)
                    console.log(`p2 won, round: ${roundCount}/${round}`)
                    await Room.updateOne(
                        { roomId },
                        { lastWinner: pName.p2, 'pWinRound.p2': pWinRound.p2, roundCount: roundCount }
                    )
                }
                clearTimeout(timeoutIds[roomId])
                const update = {
                    'pScore.p1': 0,
                    'pScore.p2': 0,
                    // 'pShipPos.p1': '',
                    'pShipPos.p2': '',
                    'pHitPos.p1': '',
                    'pHitPos.p2': '',
                    'pMissPos.p1': '',
                    'pMissPos.p2': '',
                }
                await Room.updateOne({ roomId }, update)
            }
        } else {
            socket.emit('Room does not exist (attack)')
        }
    })

    socket.on('chat', async (roomId: string, username: string, message: string) => {
        const room = await Room.findOne({ roomId })
        const swearWord = await SwearWord.findById('61744a6a4753c57fded1d6cf')
        const wordList = swearWord.wordList
        const arr = message.split(' ')
        message = ''
        for (var i = 0; i < arr.length; i++) {
            for (var j = 0; j < wordList.length; j++) {
                if (arr[i].toLowerCase() === wordList[j].toLowerCase()) {
                    arr[i] = '***'
                    break
                }
            }
            message += arr[i] + ' '
        }
        io.to(room.pSocket.p1).to(room.pSocket.p2).emit('chatBack', username, message)
    })

    socket.on('emote', async (roomId: string, username: string, emote: string) => {
        const room = await Room.findOne({ roomId })
        io.to(room.pSocket.p1).to(room.pSocket.p2).emit('emoteResponse', username, emote)
    })

    socket.on('pause', async (roomId: string) => {
        const room = await Room.findOne({ roomId })
        console.log(remainingTimeout[roomId])
        remainingTimeout[roomId] = getRemainingTime(roomId, room.timer)
        console.log('Room:' + roomId + ' RemainingTime:' + remainingTimeout[roomId])

        clearTimeout(timeoutIds[roomId])

        io.to(room.pSocket.p1).to(room.pSocket.p2).emit('pauseResponse', true)
    })

    socket.on('resume', async (roomId: string) => {
        console.log('resume')
        const room = await Room.findOne({ roomId })
        io.to(room.pSocket.p1).to(room.pSocket.p2).emit('resumeResponse', remainingTimeout[roomId])

        if (room.nextTurn === room.pName.p1) {
            const timeOutId = setTimeout(timeout, remainingTimeout[roomId], room.pSocket.p1, room.pSocket.p2, 2, roomId)
            timeoutIds[roomId] = timeOutId
            startTimeMS[roomId] = Date.now()
        } else {
            const timeOutId = setTimeout(timeout, remainingTimeout[roomId], room.pSocket.p1, room.pSocket.p2, 1, roomId)
            timeoutIds[roomId] = timeOutId
            startTimeMS[roomId] = Date.now()
        }
    })

    socket.on('disconnect', async () => {
        const roomid = 'c069323e-09dc-4394-b1f3-37969a669f37'
        const update = { 'pName.p2': '', 'pShipPos.p2': '', 'pReady.p2': false, 'pHitPos.p2': '', 'pScore.p2': 0 }
        await Room.updateOne({ roomid }, update)

        const room = await Room.findOne({ $or: [{ 'pSocket.p1': socket.id }, { 'pSocket.p2': socket.id }] })
        if (room) {
            const { roomId } = room
            clearTimeout(timeoutIds[roomId])
        }

        console.log('Disconnected!')
    })
})

console.log('Server Started!')

async function timeout(s1: string, s2: string, nextTurn: number, roomId: string) {
    const room = await Room.findOne({ roomId })

    let afterNext = 0
    let nextPlayer = ''
    if (nextTurn == 1) {
        nextPlayer = room.pName.p1
        afterNext = 2
    } else {
        nextPlayer = room.pName.p2
        afterNext = 1
    }

    await Room.updateOne({ roomId }, { nextTurn: nextPlayer })
    io.to(s1).to(s2).emit('timeOut', nextPlayer)
    const timeOutId = setTimeout(timeout, room.timer, s1, s2, afterNext, roomId)
    startTimeMS[roomId] = Date.now()
    timeoutIds[roomId] = timeOutId
}

function getRemainingTime(roomId: string, timerStep: number) {
    return timerStep - (Date.now() - startTimeMS[roomId])
}

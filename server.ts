import { v4 as uuidv4 } from 'uuid'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import User from './models/userSchema'
import Room from './models/roomSchema'
import SwearWord from './models/swearWordSchema'

//------------------------------------------- Connect to Database -------------------------------------------------//

mongoose.connect('mongodb+srv://testuser:battleship@cluster0.w9j5l.mongodb.net/battleship?retryWrites=true&w=majority')

//-----------------------------------------------------------------------------------------------------------------//

const io = new Server(3031, {
    cors: {
        origin: ['http://localhost:3031'],
    },
})

io.on('connection', (socket) => {
    console.log(socket.id)

    // open page
    socket.on('userData', async (username: string, avatarName: string) => {
        console.log(username)

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
    socket.on('createGame', async ( username: string, roundTime:number
            // cb: string
        ) => {
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
                timeOutId: '',
                timer: roundTime

            })
            await room.save()
            socket.emit('roomCode', roomId)
            // const tmp = await Room.findOne({ 'pName.p1': username })
            // console.log(tmp)
            // cb(`Room ID : ${room.roomId}`)
        }
    )

    //join game
    socket.on('joinGame', async ( roomId: string, username: string
            // cb: any
        ) => {
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
                    io.to(room.pSocket.p1).to(socket.id).emit('joinGame', true)
                    console.log(`Joined ${roomId}`)
                    // cb(`Joined ${roomId}`)
                } else {
                    socket.emit('joinGame', false);
                    console.log('This room is full!')
                    // cb(`This room is full!`)
                }
            } else {
                socket.emit('joinGame', false);
                console.log('Room does not exist (join)')
                // cb('Room does not exist (join)')
            }
        }
    )

    socket.on('findRoom', async () => {
        const count = await io.engine.clientsCount
        // console.log(typeof(count));
        // console.log(`online player: ${count}`);
        socket.emit('onlineNum', count)
        let rooms = await Room.find()
        socket.emit('findRoom', rooms)
    })

    // pre-game w/ roomId

    socket.on('ready', async ( roomId: string, username: string, shipPos: string
            // cb: any
        ) => {
            let room = await Room.findOne({ roomId })
            // console.log(room);
            if (room) {
                if (room.pName.p1 === username) {
                    await Room.updateOne({ roomId }, { 'pShipPos.p1': shipPos, 'pReady.p1': true })
                    socket.emit('ready', room.pName.p2)
                } else if (room.pName.p2 === username) {
                    await Room.updateOne({ roomId }, { 'pShipPos.p2': shipPos, 'pReady.p2': true })
                    socket.emit('ready', room.pName.p1)
                }
                // cb(`${username} is ready`);
            } else {
                console.log('room not ready 01');
                socket.emit('Room does not exist (ready)')
            }

            room = await Room.findOne({ roomId })
            if(room){
                if (room.pReady.p1 === true && room.pReady.p2 === true) {
                    let update
                    if (room.pWinRound.p1 === 0 && room.pWinRound.p2 === 0) {
                        if (Math.floor(Math.random() * 2) === 0) {
                            io.to(room.pSocket.p1).to(room.pSocket.p2).emit('checkReady', room.pName.p1, room.timer)
                            const timeOutId = setTimeout(
                                () => io.to(room.pSocket.p1).to(room.pSocket.p2).emit('timeOut', room.pName.p2, room.timer),
                                10000
                            )
                            update = { nextTurn: room.pName.p1, timeOutId }
                        } else {
                            io.to(room.pSocket.p1).to(room.pSocket.p2).emit('checkReady', room.pName.p2, room.timer)
                            const timeOutId = setTimeout(
                                () => io.to(room.pSocket.p1).to(room.pSocket.p2).emit('timeOut', room.pName.p1, room.timer),
                                10000
                            )
                            update = { nextTurn: room.pName.p2, timeOutId }
                        }
                        await Room.updateOne({ roomId }, update)
                    } else {
                        if (room.lastWinner === room.pName.p1) {
                            io.to(room.pSocket.p1).to(room.pSocket.p2).emit('checkReady', room.pName.p1, room.timer)
                            const timeOutId = setTimeout(
                                () => io.to(room.pSocket.p1).to(room.pSocket.p2).emit('timeOut', room.pName.p2, room.timer),
                                10000
                            )
                            update = { nextTurn: room.pName.p1, timeOutId }
                        } else {
                            io.to(room.pSocket.p1).to(room.pSocket.p2).emit('checkReady', room.pName.p2, room.timer)
                            const timeOutId = setTimeout(
                                () => io.to(room.pSocket.p1).to(room.pSocket.p2).emit('timeOut', room.pName.p1, room.timer),
                                10000
                            )
                            update = { nextTurn: room.pName.p2, timeOutId }
                        }
                    }
                    await Room.updateOne({ roomId }, update)
                }else{
                    console.log('room not ready 02');
                    socket.emit('Room does not exist (ready)')
                }
            } else{
                console.log('room not exist 02');
            }
        }
    )

    //attack phase w/ roomId
    socket.on('attack', async (roomId: string, username: string, shootPos: string
            // cb: any
        ) => {
            const room = await Room.findOne({ roomId })
            clearTimeout(room.timeOutId)
            if (room) {
                if (room.pName.p1 === username) {
                    const selfSocketId = room.pSocket.p1
                    const otherSocketId = room.pSocket.p2
                    if (room.pShipPos.p2.includes(shootPos)) {
                        io.to(selfSocketId).emit('attack', 'Hit', shootPos, room.pName.p1)
                        io.to(otherSocketId).emit('attacked', 'Hit', shootPos, room.pName.p1)
                        // cb(`Hit!`)
                        await Room.updateOne(
                            { roomId },
                            {
                                nextTurn: room.pName.p1,
                                'pHitPos.p1': room.pHitPos.p1 + shootPos,
                            }
                        )
                    } else {
                        io.to(selfSocketId).emit('attack', 'Missed', shootPos, room.pName.p2)
                        io.to(otherSocketId).emit('attacked', 'Missed', shootPos, room.pName.p2)
                        // cb(`Missed`)
                        await Room.updateOne(
                            { roomId },
                            {
                                nextTurn: room.pName.p2,
                                'pMissPos.p1': room.pMissPos.p1 + shootPos,
                            }
                        )
                    }
                    const timeOutId = setTimeout(
                        () => io.to(room.pSocket.p1).to(room.pSocket.p2).emit('timeOut', room.pName.p1),
                        10000
                    )
                    await Room.updateOne({ roomId }, { timeOutId })
                } else if (room.pName.p2 === username) {
                    const selfSocketId = room.pSocket.p2
                    const otherSocketId = room.pSocket.p1
                    if (room.pShipPos.p1.includes(shootPos)) {
                        io.to(selfSocketId).emit('attack', 'Hit', shootPos, room.pName.p2)
                        io.to(otherSocketId).emit('attacked', 'Hit', shootPos, room.pName.p2)
                        // cb(`Hit!`)
                        await Room.updateOne(
                            { roomId },
                            {
                                nextTurn: room.pName.p2,
                                'pHitPos.p2': room.pHitPos.p2 + shootPos,
                            }
                        )
                    } else {
                        io.to(selfSocketId).emit('attack', 'Missed', shootPos, room.pName.p1)
                        io.to(otherSocketId).emit('attacked', 'Missed', shootPos, room.pName.p1)
                        // cb(`Missed`)
                        await Room.updateOne(
                            { roomId },
                            {
                                nextTurn: room.pName.p1,
                                'pMissPos.p2': room.pMissPos.p2 + shootPos,
                            }
                        )
                    }
                    const timeOutId = setTimeout(
                        () => io.to(room.pSocket.p1).to(room.pSocket.p2).emit('timeOut', room.pName.p2),
                        10000
                    )
                    await Room.updateOne({ roomId }, { timeOutId })
                }
            } else {
                socket.emit('Room does not exist (attack)')
            }
        }
    )

    socket.on('chat', async (roomId: string, username:string, message:string) => {
        const room = await Room.findOne({ roomId });
        const swearWord = await SwearWord.findById('61744a6a4753c57fded1d6cf');
        const wordList = swearWord.wordList;
        const arr = message.split(' ');
        message = '';
        for(var i = 0; i<arr.length;i++){
            for(var j=0;j<wordList.length;j++){
                if(arr[i].toLowerCase() === wordList[j].toLowerCase()){
                    arr[i] = '***';
                    break;
                }
            }
            message+= arr[i] + ' ';
        }
        io.to(room.pSocket.p1).to(room.pSocket.p2).emit('chatBack', username, message);
    });

    socket.on('emote', (username:string, emote:string ) =>{
        
    })

    socket.on('disconnect', async() => {
        const roomId = '8371c2f7-e1df-4938-927a-e901500037e7'
        const update = {'pName.p2': '', 'pShipPos.p2': '', 'pReady.p2': false }
        await Room.updateOne({ roomId }, update);
        console.log('Disconnected!')
    })
})

console.log('Server Started!')

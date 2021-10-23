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

const io = new Server(3031, {cors:{
    origin:['http://localhost:3031']
}})

io.on('connection', (socket) => {
    console.log(socket.id)

    // open page
    socket.on('userData', async (username: string, avatarName: string) => {
        console.log(username)

        const user = await User.findOne({ username })
        if (user == null) {
            const newUser = new User({ username, socketId: socket.id, avatarName })
            await newUser.save()
            socket.emit('checkUsername', true, username)
        } else {
            socket.emit('checkUsername', false, username)
        }
    })

    // create game
    socket.on('createGame', async ( username: string
            // cb: string
    ) => {
        const roomId = uuidv4();
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
            })
            await room.save()
            socket.emit('roomCode', roomId);
            // const tmp = await Room.findOne({ 'pName.p1': username })
            // console.log(tmp)
            // cb(`Room ID : ${room.roomId}`)
        }
    )

    //join game
    socket.on('joinGame', async (roomId: string, username: string
            // cb: any
        ) => {
            const room = await Room.findOne({ roomId })
            if (room) {
                // console.log(room.pName.p1);
                if (room.pName.p2 === '') {
                    const filter = { roomId }
                    const update = { 'pName.p2': username, 'pSocket.p2': socket.id }
                    await Room.updateOne(filter, update)
                    console.log(`Joined ${roomId}`);
                    // cb(`Joined ${roomId}`)
                } else {
                    console.log('This room is full!');
                    // cb(`This room is full!`)
                }
            } else {
                console.log('Room does not exist (join)');
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
    socket.on('ready', async (roomId: string, username: string, shipPos: string
            // cb: any
        ) => {
            let room = await Room.findOne({ roomId })
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
                socket.emit('Room does not exist (ready)')
            }
            
            room = await Room.findOne({ roomId });
            if (room.pReady.p1 === true && room.pReady.p2 === true) {
                let update
                if (room.pWinRound.p1 === 0 && room.pWinRound.p2 === 0) {
                    if (Math.floor(Math.random() * 2) === 0) {
                        update = { nextTurn: 1 }
                        io.to(room.pSocket.p1).to(room.pSocket.p2).emit('checkReady', room.pName.p1)
                    } else {
                        update = { nextTurn: 2 }
                        io.to(room.pSocket.p1).to(room.pSocket.p2).emit('checkReady', room.pName.p2)
                    }
                    await Room.updateOne({ roomId }, update)
                } else {
                    if (room.lastWinner === room.pName.p1) {
                        update = { nextTurn: 1 }
                        io.to(room.pSocket.p1).to(room.pSocket.p2).emit('checkReady', room.pName.p1)
                    } else {
                        update = { nextTurn: 2 }
                        io.to(room.pSocket.p1).to(room.pSocket.p2).emit('checkReady', room.pName.p2)
                    }
                }
                await Room.updateOne({ roomId }, update)
            } 
        }
    )

    //attack phase w/ roomId
    socket.on('attack', async (roomId: string, username: string, shootPos: string
            // cb: any
        ) => {
            const room = await Room.findOne({ roomId })
            if (room) {
                if (room.pName.p1 === username) {
                    const selfSocketId = room.pSocket.p1
                    const otherSocketId = room.pSocket.p2
                    if (room.pShipPos.p2.includes(shootPos)) {
                        io.to(selfSocketId).emit('attack', 'Hit', shootPos)
                        io.to(otherSocketId).emit('attacked', 'Hit', shootPos)
                        // cb(`Hit!`)
                        await room.updateOne({ nextTurn: room.pSocket.p1, 'pHitPos.p1': room.pHitPos.p1 + shootPos })
                    } else {
                        io.to(selfSocketId).emit('attack', 'Missed', shootPos)
                        io.to(otherSocketId).emit('attacked', 'Missed', shootPos)
                        // cb(`Missed`)
                        await room.updateOne({ nextTurn: room.pSocket.p2, 'pMissPos.p1': room.pMissPos.p1 + shootPos })
                    }
                } else if (room.pName.p2 === username) {
                    const selfSocketId = room.pSocket.p2
                    const otherSocketId = room.pSocket.p1
                    if (room.pShipPos.p1.includes(shootPos)) {
                        io.to(selfSocketId).emit('attack', 'Hit', shootPos)
                        io.to(otherSocketId).emit('attacked', 'Hit', shootPos)
                        // cb(`Hit!`)
                        await room.updateOne({ nextTurn: room.pSocket.p2, 'pHitPos.p2': room.pHitPos.p2 + shootPos })
                    } else {
                        io.to(selfSocketId).emit('attack', 'Missed', shootPos)
                        io.to(otherSocketId).emit('attacked', 'Missed', shootPos)
                        // cb(`Missed`)
                        await room.updateOne({ nextTurn: room.pSocket.p1, 'pMissPos.p2': room.pMissPos.p2 + shootPos })
                    } 
                }
            } else { 
                socket.emit('Room does not exist (attack)')
            }
        }
    )

    socket.on('chat', async (roomId: String, message:String) => {
        const room = await Room.findOne({ roomId })
        const arr = message.split(' ');
        
        socket.to(room.pName.p1).to(room.pSocket.p2).emit('chat', message);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected!')
    })
})

console.log('Server Started!')

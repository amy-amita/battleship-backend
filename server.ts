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
    socket.on('userData', async (username, avatarName) => {
        console.log(username)
        // const user = new User({ username, socketId: socket.id, avatarName });
        // const valid = await User.findOne({ username });
        // if (!valid) {
        //   await user.save();
        // } else {
        //   socket.emit("messageToClient", 1); //USERNAME IS ALREADY TAKEN
        // }
    })

    // create game
    socket.on('createGame', async (username, cb) => {
        const room = new Room({
            roomId: uuidv4(),
            playerOneName: username,
            playerTwoName: '',
            playerOneCurrentScore: 0,
            playerTwoCurrentScore: 0,
            playerOneGameWin: 0,
            playerTwoGameWin: 0,
            playerOneShipPos: [],
            playerTwoShipPos: [],
            playerOneHitMissPos: [],
            playerTwoHitMissPos: [],
            time: 10,
        })
        await room.save()
        cb(`Room ID : ${room.roomId}`)
    })

    // join game
    socket.on('joinGame', async (username: string, roomId: string, cb) => {
        const filter = { roomId }
        const update = { playerTwoName: username }
        const room = await Room.findOneAndUpdate(filter, update, {
            new: true,
        })
        cb(`Joined Room ${room.roomId}`)
    })

    socket.on('messageToServer', (message: string, roomId: string) => {
        socket.to(roomId).emit('messageToClient', message)
    })

    // socket.on("join-room", (room, cb) => {
    //   socket.join(room);
    //   cb(`Joined Room ${room}`);
    // });

    // pre-game
    socket.on('shipsPos', async (username: string, pos: string) => {
        console.log(pos)
        const filter = { playerOneName: username }
        const update = { playerOneShipPos: pos }
        await Room.findOneAndUpdate(filter, update, {
            new: true,
        })
    })

    socket.on('disconnect', () => {
        console.log('Disconnected!')
    })
})

console.log('Server Started!')

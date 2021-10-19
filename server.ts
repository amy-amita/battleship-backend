import { v4 as uuidv4 } from 'uuid'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import User from './models/userSchema'
import Room from './models/roomSchema'
import { isNull } from 'util'

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
            socket.emit('checkUsername', checkUsername, username) //USERNAME IS ALREADY TAKEN
        }
    })

    // create game
    socket.on('createGame', async (username: string, cb: string) => {
        const room = new Room({
            roomId: uuidv4(),
            playerOneName: username,
            playerTwoName: '',
            playerOneCurrentScore: 0,
            playerTwoCurrentScore: 0,
            playerOneGameWin: 0,
            playerTwoGameWin: 0,
            playerOneShipPos: "",
            playerTwoShipPos: "",
            playerOneHitPos: "",
            playerTwoHitPos: "",
            playerOneMissPos: "",
            playerTwoMissPos: "",
            time: 10,
        })
        await room.save()
        // cb(`Room ID : ${room.roomId}`)
    })


    //join game
    socket.on('joinGame', async (username: string, roomId: string, cb: any) => {
        const room = await Room.findOne({ roomId });
        if(room){
            console.log(room.playerOneName);
            if (room.playerTwoName === "") {
                const filter = { roomId }
                const update = { playerTwoName: username }
                await Room.findOneAndUpdate(filter, update, {
                    new: true,
                })
                cb(`Joined ${roomId}`);
            } else {
                cb(`This room is full!`);
            }
        }
    })

    // pre-game
    socket.on('ready', async (
        // roomId: string, 
        username: string, pos: string) => {
        //const room = await Room.findOne({ roomId });
        let room = await Room.findOne({ playerOneName: 'pump'});
        if(room){
            if(room.playerOneName === username){
                const update = { playerOneShipPos: pos };
                // Room.findOneAndUpdate({ roomId }, update, {
                //     new: true,
                // })
                await Room.findOneAndUpdate({ playerOneName: 'pump' }, update, {
                    new: true,
                })
                socket.emit('ready', username);
            }else if(room.playerTwoName === username){
                const update = { playerTwoShipPos: pos }
                // Room.findOneAndUpdate({ roomId }, update, {
                //     new: true,
                // })
                await Room.findOneAndUpdate({ playerOneName: 'pump' }, update, {
                    new: true,
                })
                socket.emit('ready', username);
            }else{
                socket.emit('ready', `${username} is not in this room!`);
            }
        }
    });

    socket.on('attack', async(
        // roomId: string, 
        username: string, shootPos: string) => {
        // const room = await Room.findOne({ roomId });
        let room = await Room.findOne({ playerOneName: 'pump'});
        if(room){
            if(room.playerOneName === username){
                if(room.playerTwoShipPos.includes(shootPos)){
                    socket.emit('attack', 'Hit', shootPos);
                }else{
                    socket.emit('attack', 'Missed', shootPos);
                }
            }
            if(room.playerTwoName === username){
                if(room.playerOneShipPos.includes(shootPos)){
                    socket.emit('attack', 'Hit', shootPos);
                }else{
                    socket.emit('attack', 'Missed', shootPos);
                }
            }
        }
    })

    socket.on('disconnect', () => {
        console.log('Disconnected!')
    })
})

console.log('Server Started!')

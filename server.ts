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
            pName: {'p1': username, 'p2': ''},
            pScore: {'p1': 0, 'p2': 0},
            pWinRound: {'p1': 0, 'p2': 0},
            pShipPos: {'p1': '', 'p2': ''},
            pHitPos: {'p1': '', 'p2': ''},
            pMissPos:{'p1': '', 'p2': ''},
            time: 10,
        })
        await room.save()
        const tmp = await Room.findOne({'pName.p1': username });
        console.log(tmp);
        // cb(`Room ID : ${room.roomId}`)
    })


    //join game
    socket.on('joinGame', async (roomId: string, username: string, cb: any) => {
        const room = await Room.findOne({ roomId });
        if(room){
            // console.log(room.pName.p1);
            if (room.pName.p2 === "") {
                const filter = { roomId }
                const update = { 'pName.p2': username }
                await Room.findOneAndUpdate(filter, update, {
                    new: true,
                })
                cb(`Joined ${roomId}`);
            } else {
                cb(`This room is full!`);
            }
        }else{
            cb('Room does not exist (join)');
        }
    })

    // pre-game w/ username
    socket.on('ready', async (username: string, shipPos: string, cb: any) => {
        let room = await Room.findOne({ 'pName.p1': username});
        if(room === null){
            room = await Room.findOne({ 'pName.p2': username});
        }
        if(room){
            if(room.pName.p1 === username){
                const update = { 'pShipPos.p1': shipPos };
                await Room.findOneAndUpdate({ 'pName.p1': username }, update, {
                    new: true,
                })
                socket.emit('ready', room.pName.p2);
            }else if(room.pName.p2 === username){
                const update = { 'pShipPos.p2': shipPos }
                await Room.findOneAndUpdate({ 'pName.p2': username }, update, {
                    new: true,
                })
                socket.emit('ready', room.pName.p1);
            }
            cb(`${username} is ready`);
        }else{
            socket.emit('Room does not exist (ready)')
        }
    });

    // pre-game w/ roomId
    socket.on('ready', async (roomId: string, username: string, shipPos: string, cb: any) => {
        const room = await Room.findOne({ roomId });
        if(room){
            let update;
            if(room.pName.p1 === username){
                update = { 'pShipPos.p1': shipPos };
                socket.emit('ready', room.pName.p2);
            }else if(room.pName.p2 === username){
                update = { 'pShipPos.p2': shipPos };
                socket.emit('ready', room.pName.p1);
            }
            await Room.findOneAndUpdate({ roomId }, update, {
                new: true,
            });
            cb(`${username} is ready`);
        }else{
            socket.emit('Room does not exist (ready)')
        }
    });

    //attack phase w/ username
    socket.on('attack', async(username: string, shootPos: string, cb: any) => {
        let room = await Room.findOne({ 'pName.p1': username});
        if(room === null){
            room = await Room.findOne({ 'pName.p2': username});
        }
        if(room){
            let update;
            if(room.pName.p1 === username){
                if(room.pShipPos.p2.includes(shootPos)){
                    update = { 'pHitPos.p1': room.pHitPos.p1 + shootPos };
                    socket.emit('attack', 'Hit', shootPos);
                    cb(`Hit!`);
                }else{
                    update = { 'pMissPos.p1': room.pMissPos.p1 + shootPos };
                    socket.emit('attack', 'Missed', shootPos);
                    cb(`Missed`);
                }
                await Room.findOneAndUpdate({ 'pName.p1': username }, update, {
                    new: true,
                })
            }else if(room.pName.p2 === username){
                if(room.pShipPos.p1.includes(shootPos)){
                    update = { 'pHitPos.p2': room.pHitPos.p2 + shootPos };
                    socket.emit('attack', 'Hit', shootPos);
                    cb(`Hit!`);
                }else{
                    update = { 'pMissPos.p2': room.pMissPos.p2 + shootPos };
                    socket.emit('attack', 'Missed', shootPos);
                    cb(`Missed`);
                }
                await Room.findOneAndUpdate({ 'pName.p2': username }, update, {
                    new: true,
                })
            }
        }else{
            socket.emit('Room does not exist (attack)')
        }
    })

    //attack phase w/ roomId
    socket.on('attack', async(roomId: string, username: string, shootPos: string, cb: any) => {
        const room = await Room.findOne({ roomId });
        if(room){
            let update;
            if(room.pName.p1 === username){
                if(room.pShipPos.p2.includes(shootPos)){
                    update = { 'pHitPos.p1': room.pHitPos.p1 + shootPos };
                    socket.emit('attack', 'Hit', shootPos);
                    cb(`Hit!`);
                }else{
                    update = { 'pMissPos.p1': room.pMissPos.p1 + shootPos };
                    socket.emit('attack', 'Missed', shootPos);
                    cb(`Missed`);
                }
            }else if(room.pName.p2 === username){
                if(room.pShipPos.p1.includes(shootPos)){
                    update = { 'pHitPos.p2': room.pHitPos.p2 + shootPos };
                    socket.emit('attack', 'Hit', shootPos);
                    cb(`Hit!`);
                }else{
                    update = { 'pMissPos.p2': room.pMissPos.p2 + shootPos };
                    socket.emit('attack', 'Missed', shootPos);
                    cb(`Missed`);
                }
            }
            await Room.findOneAndUpdate({ roomId }, update, {
                new: true,
            });
        }else{
            socket.emit('Room does not exist (attack)')
        }
    });

    socket.on('disconnect', () => {
        console.log('Disconnected!')
    })
})

console.log('Server Started!')

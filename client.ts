import io from 'socket.io-client'

// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;

// const joinRoomButton = document.getElementById("room-button");
// const messageInput = document.getElementById("message-input");
// const roomInput = document.getElementById("room-input");
// const from = document.getElementById("form");

// form.addEventListener("submit", e => {
//   e.preventDeafult()
//   const message = messageInput.value;
//   const roomId = roomInput.value;

//   if (message === "") return
//   displayMessage(message);

//   messageInput.value = "";
// })




const socket = io('https://4f97-2001-fb1-9d-1698-bc04-61b-894a-5ce0.ngrok.io/')
socket.on('connect', () => {
    console.log(socket.id)
});

while(true){


        if(choice === 1){
            //create game
            socket.emit('createGame', 'test001', (cb: any) => {
                console.log(cb)
            });
        }

        if(choice === 2) {
            //join game
            socket.emit('joinGame', 'a4f1e5bf-8dbf-474e-b912-ebfb15a07978', 'james', (cb: any) => {
                console.log(cb)
                });
        }

        if(choice === 3){
            //ready w/ roomId
            socket.emit('ready', 'a4f1e5bf-8dbf-474e-b912-ebfb15a07978', 'test001', '30,20,10,00,73,63,53,43,04,14,24,34,02,12,22,32', (cb: any) => {
                console.log(cb)
            });
        }

        if(choice === 4){
            //attack w/ roomId
            socket.emit('attack', '2a4de412-2f51-4fcf-88e7-09d83abe3a12', 'james', '11',
                (cb: any) => {
                    console.log(cb)
            })
        }

        if(choice === 5){
            // socket.emit('findRoom')
            socket.on('findRoom', (rooms) => {
                console.log(rooms)
            });
        }

        if(choice === 6){
            socket.on('onlineNum', (count) => {
                console.log(`Player Online: ${count}`)
            });
        }
        rl.close();
    });
}

class SomeClass
{
    constructor(readline) {
        this.readline = readline;
    }

    askPath() {
        this.readline.question('Question: ', (answer) => {
            console.log(answer);
            this.readline.close();
            this.askPath();
        });
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let someClass = new SomeClass(rl);
someClass.askPath();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Messages from './dbMassages.js';
import Pusher from "pusher";





const port = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(cors());
//for real time use
const pusher = new Pusher({
  appId: "1182462",
  key: "c20277dcd9c2ff86a513",
  secret: "ce05fe5a7c68a3f06a88",
  cluster: "ap1",
  useTLS: true
});




// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Headers", "*");
//     next();
// });



const connection_url = "mongodb+srv://ImRidwan:this.main@cluster0.q83cw.mongodb.net/whatsapp-clone?retryWrites=true&w=majority"

mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.once("open", () => {
    console.log("DB connected");
    const messageCollections = db.collection("messages");
    const changeStream = messageCollections.watch();

    changeStream.on("change", (change) => {
    // console.log("change occured::", change)
        if (change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', ' inserted', {
                name: messageDetails.name,
                message: messageDetails.message
            })
            
        } else {
            console.log("Error triggering Pusher")
        }
    })
})


app.get('/', (req, res) => res.status(200).send("heloooooo"));

//getting all text from db
app.get('/messages/sync', (req, res) => {
    Messages.find((err, data) => {
        if (err) {
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

//posting text to the db
app.post('/massages/new', (req, res) => {
    const dbMassages = req.body;
   
    Messages.create(dbMassages, (err, data) => {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.status(200).send(data)
        }
    })
})





app.listen(port, console.log("SErver READy", port) )
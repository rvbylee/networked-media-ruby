// imports the configurations set up in the .env
// allows us to use process.env. to accsss variables in the .env file
// require('dotenv').config()
import dotenv from "dotenv";
dotenv.config();
// importing the masto.js libarry, which connects to mastodon for us. 
// const m = require('masto')
import {createRestAPIClient} from "masto";

const masto = createRestAPIClient({
    url: "https://networked-media.itp.io/",
    accessToken: process.env.TOKEN // we are accessing TOKEN from the .env file. 
})

// add the request to db 
async function retrieveData(){
    const url = 'http://159.223.99.94:7001/all-posts'
    const response = await fetch(url)
    const json = await response.json()
    console.log(json)
    //const posts = json.posts
    const posts = [{text: 'Warum ist mein Napf leer? WIESO?!!!!!! Ich rufe die Polizei.'},
        {text: 'Menschen sind nutzlos. Öffnet sofort die Tür.'},
        {text: 'Ich habe 47 Mal miaut. Keine Antwort. inakzeptabel.'},
        {text: 'Ich habe Sand in deinem Bett verteilt. Du weißt warum. =(^.^)='},
        {text: 'MIAU MIAU MIAU MIAU MIAU!! miau. MIAU!! miau? MIAU?? miau… MIAUUU— WARUM NIEMAND HÖRT?!?! miau miau miau miau miau miau miau MIAU MIAU MIAU. miau (verärgert). MIAU (wütend). miau (enttäuscht). M I A U !!! miaumiauMIAUmiaumiau miau. miau. miau. MIAU! MIAU! MIAUUUUUUUUUUuuu… miau~~ miau? miau 😾 MIAU MIAU MIAU MIAU MIAU MIAU ICH HABE HUNGER MIAU!!! miau.'},
        {text: 'Heute werde ich Chaos machen. Bin schon wach 😡😡😡😡😡😡😡😡😡'} ]
    console.log (posts)
    let randNum = Math.floor (Math.random() * (posts.length) )
    //console.log(randNum)
    console.log (posts[randNum].text)
    let randText = posts[randNum].text
    makeStatus(randText)
}

async function makeStatus(textStatus){
    const status = await masto.v1.statuses.create({
        status: textStatus,
        visibility: "public",
    })

    console.log(status.url)
}

setInterval( ()=>{
    //makeStatus()
    retrieveData()
}, 1000*60*60) //calls every hour
// makeStatus()
//retrieveData()
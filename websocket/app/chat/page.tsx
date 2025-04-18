"use client"
import { useEffect, useMemo, useState } from "react"
import { io } from 'socket.io-client';
export default function () {
    const [sendmessage, Setsendmessage] = useState('');
    const [recievemessage, Setrecievemessage] = useState('');
    const socket = useMemo(() => io('http://localhost:8001'), []);
    useEffect(() => {
        socket.emit("joinRoom", "group");

        socket.on("sendmessage",(data)=>{
            Setrecievemessage(data);
        })
    })
    function sendmessagetouser(){
        socket.emit("sendToRoom",{
            room:"group",
            "message":sendmessage
        })
    }
    return (
        <div>
            <input placeholder="Write your message" onChange={(e) => Setsendmessage((e.target.value))}></input>
            <div>
                <button onClick={sendmessagetouser}>Send Message</button>
            </div>
            <div>
                Recieve Message :{recievemessage}
            </div>
        </div>
    )
}
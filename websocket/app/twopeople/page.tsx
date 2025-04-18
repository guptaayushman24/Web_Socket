'use client'
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { io } from 'socket.io-client';
export default function () {
    let userMap = new Map<string, number>([
        ["Alice", 1],
        ["John", 2],
        ["Jam", 3]
    ]);
    const socket = useMemo(() => io('http://localhost:8001'), []);
    const [username,Setusername] = useState('');
    const [recievername,setRecievername] = useState('');
    const [sendmessage, Setsendmessage] = useState('');
    const [recievemessage, Setrecievemessage] = useState('');
    const [isloggedid, Setisloggedin] = useState(false);
    const [userindex, Setuserindex] = useState<number|undefined>(-1);

    function checkforuser(name:string){
        if (userMap.has(name)){
            Setuserindex(userMap.get(name));
            Setisloggedin(true);
        }
    }
    function startchatting(message:string,recievername:string){
        socket.emit("startconversation",{
            message:message,
            chatid:userMap.get(recievername)
        })
    }
    useEffect(() => {
       if (userindex!=-1){
        socket.emit("register-user",userindex);
        socket.on("newMessage",(data)=>{
            Setrecievemessage(data);
        })
       }
    }, [userindex])
    return (
        <div>
            <div>Two people chat</div>

            <div>
                <input placeholder="Enter the name" onChange={(e)=>Setusername(e.target.value)}></input>
            </div>

            <div>
            <button onClick={()=>checkforuser(username)}>Check for user</button>
            </div>

         {
            isloggedid ? (
                <div>
                <input placeholder="Enter message" onChange={(e)=>Setsendmessage(e.target.value)}></input>
                
                <div>
                    <input placeholder="Enter Reciever Name" onChange={(e)=>setRecievername(e.target.value)}></input>
                </div>

                <div>
                <button onClick={()=>startchatting(sendmessage,recievername)}>Send Message</button>
                </div>

                <div>
                    Recieve Message:- {recievemessage}
                </div>
            </div>
            ):null
         }
        </div>


    )
}
import {  Button, Input } from "@nextui-org/react";
import {  useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../components/socket";


export const Meeting = ({ username}) => {
    const [loading,setLoading] = useState(false);
    const navigate = useNavigate();
    const [isroomFull,setRoomFull] = useState(false);



    const newMeeting = async () => {

        try {  
            setLoading(true);           
            socket.emit('create-room',{username});
            console.log(username);

            socket.on('meeting-created', ({meetingCode}) => {
                setLoading(false);
                if( meetingCode ) {
                    console.log("room created with code:",meetingCode);               
                    navigate(`/meeting/${meetingCode}`);
                }
            });

        } catch (error) {
            console.error("Failed to create a new meeting room:", error);
        }
    };


    
    const joinMeeting = (username, meetingCode) => {
        if (!username || !meetingCode) {
            console.error("Invalid username or meeting code:", username, meetingCode);
            return;
        }
        if(username && meetingCode){
            console.log("sent join room req from meeting.jsx")
            socket.emit("join-room", { username, meetingCode });
        }
        
        socket.on("room-full",({message})=>{
            alert(message);
            setRoomFull(true);
        })

        socket.on("joined-room", ({ meetingCode }) => {
            console.log(`Successfully joined room with meeting code: ${meetingCode}`);
            navigate(`/meeting/${meetingCode}`);
        });    
        
    };  

    return (
        <div className="h-screen flex justify-center items-center">
            <div className="grid grid-cols-2 gap-20">
                <div className="bg-gray-800 rounded-lg p-6">
                    <div className="text-xl font-bold text-center p-4">Start a new meeting</div>
                    <Button color="secondary" onClick={newMeeting} className="flex justify-center items-center mx-auto">
                        <div className="text-3xl pb-2">+</div>
                        <div className="text-lg font-semibold">New Meeting</div>
                    </Button>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                    <div className="text-xl font-bold text-center p-4">Join a meeting</div>
                    <Input
                        label="Meeting Code"
                        placeholder="Enter meeting code"
                        onKeyUp={(e) => {
                            if (e.key === 'Enter') {
                                joinMeeting(username,e.target.value);
                            }
                        }}
                    />
                </div>
            </div>
            {loading && <div>Loading...</div>}
        </div>
    );
};

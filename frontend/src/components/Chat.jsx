import { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import { socket } from "../components/socket";

export const Chat = ({ username, roomId }) => {
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");

    const sendMessage = () => {
        if (currentMessage.trim() !== "") {
            const messageData = { text: currentMessage, sender: username?.[0] || "Unknown" };
            socket.emit("sendMessage", messageData);
            setCurrentMessage("");
        }
    };

    useEffect(() => {
        socket.emit("join-room", roomId, username);

        socket.on("loadMessages", (loadedMessages) => {
            setMessages(loadedMessages);
        });

        socket.on("receiveMessage", (messageData) => {
            setMessages((prevMessages) => [...prevMessages, messageData]);
        });

        return () => {
            socket.off("receiveMessage");
            socket.off("loadMessages");
        };
    }, [roomId, username]);

    return (
        <div className="h-[100%] p-4 bg-gray-800 flex flex-col">
            <div id="chat-box" className="overflow-auto h-full mb-2 border border-gray-600 rounded-lg p-2">
                {messages.map((message, index) => (
                    <div key={index} className="mb-1 break-all">
                        <strong>{message.sender || "Unknown"}: </strong>
                        <span>{message.text}</span>
                    </div>
                ))}
            </div>
            <div className="flex">
                <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            sendMessage();
                        }
                    }}
                    className="flex-grow p-2 border border-gray-400 rounded"
                    placeholder="Type a message..."
                />
                <Button onClick={sendMessage} color="secondary" className="ml-2">Send</Button>
            </div>
        </div>
    );
};

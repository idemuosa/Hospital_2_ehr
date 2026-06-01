import React, { useState, useEffect, useRef } from 'react';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [roomName, setRoomName] = useState('general');
    const socketRef = useRef(null);

    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = window.location.host;
        const socketUrl = `${protocol}://${host}/ws/chat/${roomName}/`;

        socketRef.current = new WebSocket(socketUrl);

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages((prev) => [...prev, data]);
        };

        socketRef.current.onclose = () => {
            console.log('WebSocket disconnected');
        };

        return () => {
            socketRef.current.close();
        };
    }, [roomName]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (input.trim() && socketRef.current) {
            socketRef.current.send(JSON.stringify({
                message: input,
                user: 'User' // Replace with actual user info
            }));
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-full max-w-2xl mx-auto p-4 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Chat: {roomName}</h2>
            <div className="flex-1 overflow-y-auto mb-4 border p-4 rounded bg-gray-50 min-h-[400px]">
                {messages.map((msg, index) => (
                    <div key={index} className="mb-2">
                        <span className="font-bold text-blue-600">{msg.user}: </span>
                        <span>{msg.message}</span>
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type a message..."
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default Chat;

import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Send, Users, Hash } from 'lucide-react';

const Chat = () => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [roomName, setRoomName] = useState('general');
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    const rooms = [
        { id: 'general', name: 'General', icon: Hash },
        { id: 'doctors', name: 'Doctors Lounge', icon: Users },
        { id: 'nurses', name: 'Nursing Station', icon: Users },
        { id: 'emergency', name: 'Emergency Room', icon: Hash },
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const apiHost = import.meta.env.VITE_API_URL
            ? import.meta.env.VITE_API_URL.replace(/^https?:\/\//, '')
            : window.location.host;
        const socketUrl = `${protocol}://${apiHost}/ws/chat/${roomName}/`;

        socketRef.current = new WebSocket(socketUrl);

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages((prev) => [...prev, data]);
        };

        return () => {
            if (socketRef.current) socketRef.current.close();
            setMessages([]);
        };
    }, [roomName]);

    useEffect(scrollToBottom, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (input.trim() && socketRef.current) {
            socketRef.current.send(JSON.stringify({
                message: input,
                user: user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username || 'Staff'
            }));
            setInput('');
        }
    };

    return (
        <div className="flex h-[calc(100vh-100px)] bg-white rounded-xl shadow-sm border overflow-hidden m-4">
            {/* Sidebar */}
            <div className="w-64 border-r bg-gray-50 flex flex-col">
                <div className="p-4 border-b bg-white">
                    <h2 className="font-bold text-gray-700">Channels</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {rooms.map((room) => (
                        <button
                            key={room.id}
                            onClick={() => setRoomName(room.id)}
                            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors mb-1 ${
                                roomName === room.id ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <room.icon size={18} />
                            <span className="font-medium">{room.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                <div className="h-16 border-b flex items-center px-6 justify-between bg-white shadow-sm">
                    <div className="flex items-center space-x-2">
                        <Hash className="text-indigo-600" size={20} />
                        <h2 className="text-lg font-bold text-gray-800 capitalize">{roomName} Room</h2>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                    {messages.map((msg, index) => {
                        const isMe = msg.user === (user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username);
                        return (
                            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                                    isMe ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-800'
                                }`}>
                                    {!isMe && <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">{msg.user}</p>}
                                    <p className="text-sm">{msg.message}</p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t">
                    <form onSubmit={sendMessage} className="flex space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 border border-gray-200 rounded-full px-6 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
                            placeholder={`Message #${roomName}...`}
                        />
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition transform active:scale-95 shadow-md"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat;

import React, { useEffect, useRef, useState } from "react";
import { Layout, Button, List, Input } from "antd";
import Peer from "peerjs";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const { Content } = Layout;

export default function MeetingPage() {
  const { meetingId } = useParams();
  const [peerId, setPeerId] = useState("");
  const [peers, setPeers] = useState({});

  const [messages, setMessages] = useState([]); // ✅ State để lưu tin nhắn
  const [messageInput, setMessageInput] = useState("");

  const peer = useRef(null);
  const socket = useRef(io("https://etutoring-1640-1.onrender.com"));
  const userStream = useRef(null);
  const videoRefs = useRef({});

  useEffect(() => {
    if (!meetingId) return;

    peer.current = new Peer();

    peer.current.on("open", (id) => {
      setPeerId(id);
      socket.current.emit("join_meeting", { meetingId, peerId: id });
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      userStream.current = stream;

      // Thêm video của chính mình vào danh sách
      setPeers((prev) => ({
        ...prev,
        [peer.current.id]: { stream },
      }));
    });

    socket.current.on("user_connected", ({ peerId }) => {
      console.log(`🔗 User connected: ${peerId}`);

      setPeers((prev) => ({
        ...prev,
        [peerId]: { stream: null },
      }));
    });

    peer.current.on("call", (call) => {
      console.log("📞 Incoming call from", call.peer);
      call.answer(userStream.current);

      call.on("stream", (remoteStream) => {
        console.log("🎥 Received remote stream from", call.peer);
        setPeers((prev) => ({
          ...prev,
          [call.peer]: { stream: remoteStream },
        }));
      });
    });
    
    socket.current.on("receive_message", ({ sender, text }) => {
      setMessages((prev) => [...prev, { sender, text }]);
    });

    return () => {
      peer.current.destroy();
      socket.current.disconnect();
    };
  }, [meetingId]);

  const startCall = () => {
    if (!userStream.current) return;

    Object.keys(peers).forEach((remotePeerId) => {
      if (remotePeerId !== peer.current.id) {
        console.log(`📞 Calling ${remotePeerId}`);
        const call = peer.current.call(remotePeerId, userStream.current);

        call.on("stream", (remoteStream) => {
          console.log(`🎥 Received remote stream from ${remotePeerId}`);
          setPeers((prev) => ({
            ...prev,
            [remotePeerId]: { stream: remoteStream },
          }));
        });
      }
    });
  };


  const sendMessage = () => {
    if (messageInput.trim() === "") return;
    const messageData = { sender: peerId, text: messageInput };
  
    // Gửi tin nhắn lên server
    socket.current.emit("send_message", { meetingId, ...messageData });
  
    // Hiển thị tin nhắn ngay lập tức (không cần đợi phản hồi từ server)
    setMessages((prev) => [...prev, messageData]);
    setMessageInput("");
  };
  


  return (
    <Content style={{ padding: "2rem" }}>
      <h2>Meeting Room: {meetingId || "Loading..."}</h2>
      <p>Your Peer ID: {peerId}</p>
      <Button onClick={startCall} type="primary">Start Call</Button>

      <div style={{ display: "flex", flexWrap: "wrap", marginTop: "20px" }}>
        {Object.entries(peers).map(([id, { stream }]) => (
          <video
            key={id}
            ref={(el) => {
              if (el && stream && el.srcObject !== stream) {
                el.srcObject = stream;
              }
            }}
            autoPlay
            playsInline
            style={{ width: "30%", border: "1px solid black" }}
          />
        ))}
      </div>

      {/* Chat Box */}
      <div style={{ flex: 1, border: "1px solid #ddd", padding: "10px", borderRadius: "5px" }}>
        <h3>Chat</h3>
        <List
          size="small"
          bordered
          dataSource={messages}
          renderItem={(item) => (
            <List.Item>
              <strong>{item.sender}:</strong> {item.text}
            </List.Item>
          )}
          style={{ height: "300px", overflowY: "auto" }}
        />
        <Input.Group compact>
          <Input
            style={{ width: "80%" }}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
          />
          <Button type="primary" onClick={sendMessage}>
            Send
          </Button>
        </Input.Group>
      </div>
    </Content>
  );
}

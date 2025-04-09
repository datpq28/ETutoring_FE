import React, { useEffect, useRef, useState } from "react";
import { Layout, Button, List, Input, Space, Row, Col } from "antd";
import { io } from "socket.io-client";
import { useParams,useNavigate } from "react-router-dom";
import { VideoCameraOutlined, CloseCircleOutlined, AudioMutedOutlined, AudioOutlined } from '@ant-design/icons';

const { Content } = Layout;

export default function MeetingPageShared() {
  const { meetingId } = useParams();
  const [peers, setPeers] = useState({});
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [localStream, setLocalStream] = useState(null);
  const socket = useRef(null); // Initialize socket as null
  const peerConnections = useRef({});
  const videoRefs = useRef({});
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);

  const userRole = localStorage.getItem("role");
  const isLeaving = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!meetingId) return;

    socket.current = io("https://etutoring-1640-1.onrender.com"); // Initialize socket here

    let currentLocalStream;

    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        currentLocalStream = stream;
        setPeers((prev) => ({ ...prev, local: { stream } }));
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    getMedia();

    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    if (userId && role) {
      socket.current.emit("register_user", { userId, role });
      console.log("Socket registered:", userId);
    }

    socket.current.emit("join_room", { meetingId });

    socket.current.on("connect", () => {
      setIsConnected(true);
      console.log("🔗 Connected to Socket.IO server with ID:", socket.current.id);
    });

    socket.current.on("user_joined", ({ userId }) => {
      console.log(`🔗 User joined: ${userId}`);
      createPeerConnection(userId, true, currentLocalStream);
    });

    socket.current.on("offer", async ({ userId, offer }) => {
      console.log(`📩 Received offer from ${userId}`);
      if (!peerConnections.current[userId]) {
        const peerConnection = createPeerConnection(userId, false, currentLocalStream);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.current.emit("answer", { userId, answer });
      } else {
        await peerConnections.current[userId].setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnections.current[userId].createAnswer();
        await peerConnections.current[userId].setLocalDescription(answer);
        socket.current.emit("answer", { userId, answer });
      }
    });

    socket.current.on("answer", async ({ userId, answer }) => {
      console.log(`📩 Received answer from ${userId}`);
      if (peerConnections.current[userId]) {
        await peerConnections.current[userId].setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.current.on("ice_candidate", async ({ userId, candidate }) => {
      console.log(`📩 Received ICE candidate from ${userId}`);
      if (peerConnections.current[userId]) {
        try {
          await peerConnections.current[userId].addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    });

    socket.current.on("user_left", ({ userId }) => {
      console.log(`❌ User left: ${userId}`);
      if (peerConnections.current[userId]) {
        peerConnections.current[userId].close();
        delete peerConnections.current[userId];
      }
      setPeers((prev) => {
        const updatedPeers = { ...prev };
        delete updatedPeers[userId];
        return updatedPeers;
      });
    });

    socket.current.on("disconnect", () => {
      console.log("❌ Disconnected from Socket.IO server");
      setIsConnected(false);
    });

    socket.current.on("receive_message", ({ sender, text }) => {
      console.log(`📩 Received message from ${sender}: ${text}`);
      if (sender !== socket.current?.id) {
        setMessages((prev) => [...prev, { sender, text }]);
      }
    });

    return () => {
      if (socket.current) {
        socket.current.emit("leave_room", { meetingId });
        Object.values(peerConnections.current).forEach((peerConnection) => peerConnection.close());
        socket.current.off("connect");
        socket.current.off("user_joined");
        socket.current.off("offer");
        socket.current.off("answer");
        socket.current.off("ice_candidate");
        socket.current.off("user_left");
        socket.current.off("disconnect");
        socket.current.off("receive_message");
        socket.current.disconnect();
      }
      if (currentLocalStream) {
        currentLocalStream.getTracks().forEach((track) => track.stop());
      }
      if (isLeaving.current && socket.current) {
        socket.current.emit("leave_room", { meetingId });
        Object.values(peerConnections.current).forEach((peerConnection) => peerConnection.close());
        if (currentLocalStream) {
          currentLocalStream.getTracks().forEach((track) => track.stop());
        }
        socket.current.disconnect();
      }
    };
  }, [meetingId,navigate, userRole]);

  const createPeerConnection = (userId, isInitiator, stream) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    stream?.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });

    peerConnection.ontrack = (event) => {
      console.log(`🎥 Received remote stream from ${userId}`);
      setPeers((prev) => ({
        ...prev,
        [userId]: { stream: event.streams[0] },
      }));
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket.current) {
        socket.current.emit("ice_candidate", { userId, candidate: event.candidate });
      }
    };

    peerConnections.current[userId] = peerConnection;

    if (isInitiator) {
      peerConnection.createOffer().then((offer) => {
        peerConnection.setLocalDescription(offer);
        if (socket.current) {
          socket.current.emit("offer", { userId, offer });
        }
      });
    }

    return peerConnection;
  };

  const sendMessage = () => {
    if (!isConnected || !socket.current) {
      console.error("❌ Not connected to the server or socket not initialized. Cannot send message.");
      return;
    }
    if (messageInput.trim() === "") return;
    const currentSocketId = socket.current.id;
    if (!currentSocketId) {
      console.error("❌ Socket ID is not available yet.");
      return;
    }

    const messageData = {
      meetingId,
      sender: currentSocketId,
      text: messageInput,
    };

    console.log("📤 Sending message:", messageData);
    socket.current.emit("send_message", messageData);
    setMessages((prev) => [...prev, { sender: "You", text: messageInput }]);
    setMessageInput("");
  };

  const handleLeaveCleanup = () => {
    if (socket.current && meetingId) {
      socket.current.emit("leave_room", { meetingId });
      Object.values(peerConnections.current).forEach((peerConnection) => peerConnection.close());
      peerConnections.current = {};
      setPeers({});
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
      socket.current.disconnect();
    }
  };

  const handleLeaveMeeting = () => {
    isLeaving.current = true;
    // Disable camera and mic before leaving
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = false);
      localStream.getAudioTracks().forEach(track => track.enabled = false);
      setLocalStream(null); // Optionally set localStream to null to reflect UI change
    }
    handleLeaveCleanup(); // Perform the cleanup actions
    if (userRole === "tutor") {
      navigate('/tutor/calendar');
    } else if (userRole === "student") {
      navigate('/student/calendar');
    } else {
      navigate('/'); // Default redirect
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = !isCameraEnabled;
        setIsCameraEnabled(!isCameraEnabled);
      }
    }
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = !isMicEnabled;
        setIsMicEnabled(!isMicEnabled);
      }
    }
  };

  return (
    <Content style={{ padding: "2rem" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: "1rem" }}>
        <h2>Meeting Room: {meetingId || "Loading..."}</h2>
        <Button onClick={handleLeaveMeeting}>Leave Meeting</Button>
      </Row>
      

      
      <div style={{ display: "flex", flexWrap: "wrap", marginTop: "20px" }}>
        {localStream && (
          <div style={{ border: "1px solid blue", margin: "10px", width: "200px", position: 'relative' }}>
            <video
              key="local"
              ref={(el) => {
                if (el && localStream && el.srcObject !== localStream) {
                  el.srcObject = localStream;
                }
              }}
              autoPlay
              playsInline
              muted
              style={{ width: "100%" }}
            />
            <div style={{ position: 'absolute', bottom: '5px', left: '5px', backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '5px', borderRadius: '5px' }}>
              <Button icon={isCameraEnabled ? <VideoCameraOutlined /> : <CloseCircleOutlined />} size="small" onClick={toggleCamera} style={{ marginRight: '5px' }} />
              <Button icon={isMicEnabled ? <AudioOutlined /> : <AudioMutedOutlined />} size="small" onClick={toggleMic} />
            </div>
          </div>
        )}
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
            style={{ width: "30%", border: "1px solid black", margin: "10px" }}
          />
        ))}
      </div>

      <div style={{ flex: 1, border: "1px solid #ddd", padding: "10px", borderRadius: "5px", marginTop: "20px" }}>
        <h3>Chat</h3>
        <List
          size="small"
          bordered
          dataSource={messages}
          renderItem={(item) => (
            <List.Item>
              <strong>{item.sender === socket.current?.id ? "You" : "Participant"}:</strong> {item.text}
            </List.Item>
          )}
          style={{ height: "300px", overflowY: "auto" }}
        />
        <Space.Compact style={{ width: "100%" }}>
          <Input
            style={{ width: "80%" }}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
          />
          <Button type="primary" onClick={sendMessage} disabled={!isConnected || !socket.current}>
            Send
          </Button>
        </Space.Compact>
      </div>

    </Content>
  );
}

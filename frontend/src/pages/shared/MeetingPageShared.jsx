import React, { useEffect, useRef, useState } from "react";
import { Layout, Button, List, Input, Space, Row, Col } from "antd";
import { io } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import { VideoCameraOutlined, CloseCircleOutlined, AudioMutedOutlined, AudioOutlined } from '@ant-design/icons';

const { Content } = Layout;

export default function MeetingPageShared() {
  const { meetingId } = useParams();
  const [peers, setPeers] = useState({});
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [localStream, setLocalStream] = useState(null);
  const socket = useRef(null);
  const peerConnections = useRef({});
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);

  const userRole = localStorage.getItem("role");
  const isLeaving = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!meetingId) return;

    socket.current = io("https://etutoring-be.onrender.com");

    let currentLocalStream;

    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        currentLocalStream = stream;
        setPeers((prev) => ({ ...prev, local: { stream } }));
      } catch (error) {
        console.error("❌ Error accessing media devices:", error);
      }
    };

    getMedia();

    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    if (userId && role) {
      socket.current.emit("register_user", { userId, role });
      console.log("✅ Socket registered:", userId);
    }

    socket.current.emit("join_room", { meetingId });

    socket.current.on("connect", () => {
      setIsConnected(true);
      console.log("🔗 Connected to Socket.IO server with ID:", socket.current.id);
    });

    socket.current.on("user_joined", ({ userId }) => {
      console.log(`👤 User joined: ${userId}`);
      createPeerConnection(userId, true, currentLocalStream);
    });

    socket.current.on("offer", async ({ userId, offer }) => {
      console.log(`📨 Received offer from ${userId}`);
      if (!peerConnections.current[userId]) {
        const pc = createPeerConnection(userId, false, currentLocalStream);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.current.emit("answer", { userId, answer });
      }
    });

    socket.current.on("answer", async ({ userId, answer }) => {
      console.log(`📨 Received answer from ${userId}`);
      if (peerConnections.current[userId]) {
        await peerConnections.current[userId].setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.current.on("ice_candidate", async ({ userId, candidate }) => {
      console.log(`🧊 Received ICE candidate from ${userId}`);
      if (peerConnections.current[userId]) {
        try {
          await peerConnections.current[userId].addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("❌ Error adding ICE candidate:", error);
        }
      }
    });

    socket.current.on("user_left", ({ userId }) => {
      console.log(`👋 User left: ${userId}`);
      if (peerConnections.current[userId]) {
        peerConnections.current[userId].close();
        delete peerConnections.current[userId];
      }
      setPeers((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    });

    socket.current.on("disconnect", () => {
      console.log("❌ Disconnected from server");
      setIsConnected(false);
    });

    socket.current.on("receive_message", ({ sender, text }) => {
      if (sender !== socket.current?.id) {
        setMessages((prev) => [...prev, { sender, text }]);
      }
    });

    return () => {
      if (socket.current) {
        socket.current.emit("leave_room", { meetingId });
        Object.values(peerConnections.current).forEach((pc) => pc.close());
        socket.current.disconnect();
      }
      if (currentLocalStream) {
        currentLocalStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [meetingId, navigate, userRole]);

  const createPeerConnection = (userId, isInitiator, stream) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    stream?.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    pc.ontrack = (event) => {
      console.log(`🎥 ontrack fired for ${userId}`, event);
      if (event.streams && event.streams[0]) {
        setPeers((prev) => ({
          ...prev,
          [userId]: { stream: event.streams[0] },
        }));
      } else {
        console.warn(`⚠️ No stream found for ${userId}`);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`📤 Sending ICE candidate to ${userId}`);
        socket.current.emit("ice_candidate", { userId, candidate: event.candidate });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`🔄 ICE connection state for ${userId}:`, pc.iceConnectionState);
    };

    peerConnections.current[userId] = pc;

    if (isInitiator) {
      pc.createOffer()
        .then((offer) => {
          pc.setLocalDescription(offer);
          socket.current.emit("offer", { userId, offer });
        })
        .catch((err) => console.error("❌ Offer creation error:", err));
    }

    return pc;
  };

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    const messageData = {
      meetingId,
      sender: socket.current.id,
      text: messageInput,
    };
    socket.current.emit("send_message", messageData);
    setMessages((prev) => [...prev, { sender: socket.current.id, text: messageInput }]);
    setMessageInput("");
  };

  const handleLeaveMeeting = () => {
    if (socket.current) {
      socket.current.emit("leave_room", { meetingId });
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      if (localStream) localStream.getTracks().forEach((track) => track.stop());
      socket.current.disconnect();
    }
    navigate(userRole === "tutor" ? "/tutor/calendar" : "/student/calendar");
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !isCameraEnabled;
      setIsCameraEnabled(!isCameraEnabled);
    }
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !isMicEnabled;
      setIsMicEnabled(!isMicEnabled);
    }
  };

  return (
    <Content style={{ padding: "2rem" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: "1rem" }}>
        <h2>Meeting Room: {meetingId || "Loading..."}</h2>
        <Button onClick={handleLeaveMeeting}>Leave Meeting</Button>
      </Row>

      <div style={{ display: "flex", flexWrap: "wrap", marginTop: "20px" }}>
      <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "10px",
    justifyContent: "center",
    alignItems: "center",
  }}
>
  {/* Local video */}
  {localStream && (
    <div style={{ position: "relative", aspectRatio: "1 / 1", background: "#000" }}>
      <video
        ref={(el) => el && localStream && (el.srcObject = localStream)}
        autoPlay
        muted
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 5,
          left: 5,
          background: "#00000088",
          padding: "4px",
          borderRadius: "5px",
        }}
      >
        <Button
          icon={isCameraEnabled ? <VideoCameraOutlined /> : <CloseCircleOutlined />}
          onClick={toggleCamera}
          size="small"
          style={{ marginRight: 4 }}
        />
        <Button
          icon={isMicEnabled ? <AudioOutlined /> : <AudioMutedOutlined />}
          onClick={toggleMic}
          size="small"
        />
      </div>
    </div>
  )}

  {/* Other participants */}
  {Object.entries(peers).map(
    ([id, { stream }]) =>
      id !== "local" &&
      stream && (
        <div
          key={id}
          style={{
            position: "relative",
            aspectRatio: "1 / 1",
            background: "#000",
            borderRadius: 10,
          }}
        >
          <video
            ref={(el) => el && stream && (el.srcObject = stream)}
            autoPlay
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }}
          />
        </div>
      )
  )}
</div>
      </div>

      <div style={{ marginTop: 20, border: "1px solid #ddd", padding: 10 }}>
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
          style={{ height: 300, overflowY: "auto" }}
        />
        <Space.Compact style={{ width: "100%", marginTop: 8 }}>
          <Input value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Type a message..." />
          <Button type="primary" onClick={sendMessage} disabled={!isConnected}>Send</Button>
        </Space.Compact>
      </div>
    </Content>
  );
}

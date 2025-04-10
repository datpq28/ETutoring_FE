import React, { useEffect, useRef, useState } from "react";
import { Layout, Button, List, Input, Space, Row } from "antd";
import { io } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import {
  VideoCameraOutlined,
  CloseCircleOutlined,
  AudioMutedOutlined,
  AudioOutlined,
} from "@ant-design/icons";

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
  const userId = localStorage.getItem("userId");
  const isLeaving = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!meetingId) return;

    socket.current = io("https://etutoring-be.onrender.com");

    let currentLocalStream;

    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        currentLocalStream = stream;
        setPeers((prev) => ({
          ...prev,
          [userId]: { stream }, // Store by userId instead of 'local'
        }));
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    getMedia();

    if (userId && userRole) {
      socket.current.emit("register_user", { userId, role: userRole });
    }

    socket.current.emit("join_room", { meetingId });

    socket.current.on("connect", () => {
      setIsConnected(true);
    });

    socket.current.on("user_joined", ({ userId: newUserId }) => {
      if (newUserId !== userId && !peerConnections.current[newUserId]) {
        createPeerConnection(newUserId, true, currentLocalStream);
      }
    });

    socket.current.on("offer", async ({ userId: remoteUserId, offer }) => {
      if (!peerConnections.current[remoteUserId]) {
        const pc = createPeerConnection(remoteUserId, false, currentLocalStream);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.current.emit("answer", { userId: remoteUserId, answer });
      }
    });

    socket.current.on("answer", async ({ userId: remoteUserId, answer }) => {
      if (peerConnections.current[remoteUserId]) {
        await peerConnections.current[remoteUserId].setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    });

    socket.current.on("ice_candidate", async ({ userId: remoteUserId, candidate }) => {
      if (peerConnections.current[remoteUserId]) {
        try {
          await peerConnections.current[remoteUserId].addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    });

    socket.current.on("user_left", ({ userId: leftUserId }) => {
      if (peerConnections.current[leftUserId]) {
        peerConnections.current[leftUserId].close();
        delete peerConnections.current[leftUserId];
      }
      setPeers((prev) => {
        const updatedPeers = { ...prev };
        delete updatedPeers[leftUserId];
        return updatedPeers;
      });
    });

    socket.current.on("disconnect", () => {
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
  }, [meetingId]);

  const createPeerConnection = (remoteUserId, isInitiator, stream) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    stream?.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });

    peerConnection.ontrack = (event) => {
      setPeers((prev) => ({
        ...prev,
        [remoteUserId]: { stream: event.streams[0] },
      }));
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket.current) {
        socket.current.emit("ice_candidate", {
          userId: remoteUserId,
          candidate: event.candidate,
        });
      }
    };

    peerConnections.current[remoteUserId] = peerConnection;

    if (isInitiator) {
      peerConnection.createOffer().then((offer) => {
        peerConnection.setLocalDescription(offer);
        socket.current.emit("offer", { userId: remoteUserId, offer });
      });
    }

    return peerConnection;
  };

  const sendMessage = () => {
    if (!isConnected || !socket.current) return;
    if (messageInput.trim() === "") return;

    const messageData = {
      meetingId,
      sender: socket.current.id,
      text: messageInput,
    };

    socket.current.emit("send_message", messageData);
    setMessages((prev) => [
      ...prev,
      { sender: socket.current.id, text: messageInput },
    ]);
    setMessageInput("");
  };

  const handleLeaveMeeting = () => {
    isLeaving.current = true;
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (socket.current) {
      socket.current.emit("leave_room", { meetingId });
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      socket.current.disconnect();
    }

    if (userRole === "tutor") {
      navigate("/tutor/calendar");
    } else {
      navigate("/student/calendar");
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
        <h2>Meeting Room: {meetingId}</h2>
        <Button onClick={handleLeaveMeeting}>Leave Meeting</Button>
      </Row>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {Object.entries(peers).map(([id, { stream }]) => (
          <div
            key={id}
            style={{
              border: "1px solid #ccc",
              margin: "10px",
              width: "300px",
              position: "relative",
            }}
          >
            <video
              ref={(el) => {
                if (el && stream && el.srcObject !== stream) {
                  el.srcObject = stream;
                }
              }}
              autoPlay
              playsInline
              muted={id === userId} // Only mute local stream
              style={{ width: "100%" }}
            />
            {id === userId && (
              <div
                style={{
                  position: "absolute",
                  bottom: "5px",
                  left: "5px",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  padding: "5px",
                  borderRadius: "5px",
                }}
              >
                <Button
                  icon={isCameraEnabled ? <VideoCameraOutlined /> : <CloseCircleOutlined />}
                  size="small"
                  onClick={toggleCamera}
                  style={{ marginRight: "5px" }}
                />
                <Button
                  icon={isMicEnabled ? <AudioOutlined /> : <AudioMutedOutlined />}
                  size="small"
                  onClick={toggleMic}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "20px",
          border: "1px solid #ddd",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        <h3>Chat</h3>
        <List
          size="small"
          bordered
          dataSource={messages}
          renderItem={(item) => (
            <List.Item>
              <strong>{item.sender === socket.current?.id ? "You" : "Participant"}:</strong>{" "}
              {item.text}
            </List.Item>
          )}
          style={{ height: "300px", overflowY: "auto" }}
        />
        <Space.Compact style={{ width: "100%", marginTop: "10px" }}>
          <Input
            style={{ width: "80%" }}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
          />
          <Button type="primary" onClick={sendMessage}>
            Send
          </Button>
        </Space.Compact>
      </div>
    </Content>
  );
}

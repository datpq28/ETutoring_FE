import { SendOutlined, UserOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Empty,
  Flex,
  Form,
  Input,
  Typography,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { getAllUser } from "../../../api_service/mesages_service";
const userId = localStorage.getItem("userId");

export default function ChatBox({
  messages,
  onSendMessage,
  otherParticipantId,
}) {
  const messagesContainerRef = useRef(null); // Tham chiếu đến container tin nhắn
  const [newMessage, setNewMessage] = useState("");
  const [otherParticipant, setOtherParticipant] = useState(null);
  const [form] = Form.useForm();
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const getOtherParticipant = async () => {
      const userList = await getAllUser();
      const otherParticipant =
        userList.students.find(
          (student) => student._id === otherParticipantId
        ) ||
        userList.tutors.find((tutor) => tutor._id === otherParticipantId) ||
        null;
      setOtherParticipant(otherParticipant);
    };
    getOtherParticipant();
  }, [otherParticipantId]);

  const onFinish = async () => {
    await onSendMessage(newMessage);
    setNewMessage("");
  };

  // Xử lý sự kiện khi nhấn Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Ngăn xuống dòng
      form.submit(); // Gửi form
    }
  };

  return (
    <Card
      style={{ flex: 1 }}
      title={
        <TitleMessage
          title={`${otherParticipant?.firstname || "Chat"} ${
            otherParticipant?.lastname || ""
          }`}
          otherParticipantId={otherParticipantId}
        />
      }
    >
      <div
        style={{ height: "65vh", overflowY: "auto", padding: "1rem" }}
        ref={messagesContainerRef}
      >
        {messages.length === 0 ? (
          <Empty description="Not messages yet" />
        ) : (
          messages.map((msg, index) => (
            <Flex
              key={index}
              align="center"
              justify={msg.senderId === userId ? "end" : "start"} // Thay đổi vị trí căn của người gửi và người nhận
              style={{ marginTop: "1.6rem" }}
            >
              {msg.senderId !== userId && (
                <Avatar
                  style={{ marginRight: "0.5rem" }}
                  src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${otherParticipantId}`}
                ></Avatar>
              )}

              <Card
                size="small"
                style={{
                  background: msg.senderId === userId ? "#4096ff" : "#fff",
                  color: msg.senderId === userId ? "#fff" : "#000",
                }}
              >
                <Typography.Text
                  style={{
                    color: msg.senderId === userId ? "white" : "black",
                  }}
                >
                  {msg.content}
                </Typography.Text>
              </Card>
              {msg.senderId === userId && (
                <Avatar
                  style={{ marginLeft: "0.5rem" }}
                  src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${userId}`}
                ></Avatar>
              )}
            </Flex>
          ))
        )}
      </div>

      {/* Ô nhập tin nhắn và nút gửi */}
      <Form form={form} onFinish={onFinish}>
        <Flex gap="small" align="center" style={{ marginTop: "1rem" }}>
          <Input.TextArea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            autoSize={{ minRows: 1, maxRows: 4 }}
          />
          <Button type="primary" icon={<SendOutlined />} />
        </Flex>
      </Form>
    </Card>
  );
}

function TitleMessage({ title, otherParticipantId }) {
  return (
    <Flex gap="small" align="center">
      <Avatar
        src={
          otherParticipantId
            ? `https://api.dicebear.com/7.x/miniavs/svg?seed=${otherParticipantId}`
            : null
        }
        icon={otherParticipantId ? null : <UserOutlined />}
      />
      <span>{title}</span>
    </Flex>
  );
}

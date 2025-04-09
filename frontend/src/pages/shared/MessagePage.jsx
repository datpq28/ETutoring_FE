import { Flex, Layout } from "antd";
import { useEffect, useState, useCallback } from "react";
import {
  getConversations,
  getConversationById,
  getAllUser,
  sendMessage,
} from "../../../api_service/mesages_service.js";
import dayjs from "dayjs";
import io from "socket.io-client";
import UserList from "../../components/MessagePage/UserList.jsx";
import { formatTime } from "../../utils/Date.js";
import { truncateText } from "../../utils/Common.js";
import ModalCreateConversation from "../../components/MessagePage/ModalCreateConversation.jsx";
import ChatBox from "../../components/MessagePage/ChatBox.jsx";

const { Content } = Layout;
const userId = localStorage.getItem("userId");
const senderModel = localStorage.getItem("role");
export default function MessagePage() {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [otherParticipantId, setOtherParticipantId] = useState(null);
  const [messages, setMessages] = useState([]); // Lưu tin nhắn
  const [isAddConversationModalOpen, setIsAddConversationModalOpen] =
    useState(false); // Modal thêm cuộc trò chuyện
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    const userId = localStorage.getItem("userId");
    const userModel = localStorage.getItem("role");
    if (userId && userModel) {
      try {
        const data = await getConversations(userId, userModel);
        if (Array.isArray(data) && data.length > 0) {
          const updatedConversations = await Promise.all(
            data.map(async (conversation) => {
              const convertData = await getConversationById(conversation._id);
              let lastMessage = "";
              if (convertData.messages.length > 0) {
                const formattedMessages = convertData.messages.flatMap((msg) =>
                  msg.contents.map((content) => ({
                    senderId: msg.senderId,
                    content: content.content,
                    timestamp: content.timestamp,
                  }))
                );
                const messagesSorted = formattedMessages.sort(
                  (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
                );

                const messageByUser = messagesSorted.pop();

                lastMessage = `${
                  messageByUser.senderId === userId ? "You: " : " "
                }${truncateText(messageByUser.content, 20)} • ${formatTime(
                  messageByUser.timestamp
                )}`;
              } else {
                lastMessage = "Not messages yet";
              }
              const updatedParticipants = await Promise.all(
                conversation.participants.map(async (participant) => {
                  const userDetails = await getUserDetails(
                    participant.participantId
                  );
                  return {
                    ...participant,
                    fullName: `${userDetails.firstname} ${userDetails.lastname}`,
                  };
                })
              );

              return {
                ...conversation,
                lastMessage,
                participants: updatedParticipants,
              };
            })
          );
          setConversations(updatedConversations);
        } else {
          console.warn("không phải lỗi mà chỉ là thông báo mảng rỗng", data);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.warn("No userId or userModel found in localStorage");
    }
  }, []);

  // useEffect gọi hàm fetchConversations
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    const socketIo = io("https://etutoring-1640-1.onrender.com", {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    socketIo.on("receiveMessage", (message) => {
      if (currentConversationId === message.conversationId && !sendingMessage) {
        setMessages((prevMessages) => {
          // Check if the message already exists in the list
          if (
            !prevMessages.some(
              (msg) =>
                msg.content === message.content &&
                msg.timestamp === message.timestamp
            )
          ) {
            return [...prevMessages, message].sort(
              (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
            ); // Sort by timestamp
          }
          return prevMessages;
        });
      }
    });

    return () => {
      socketIo.disconnect();
    };
  }, [currentConversationId, sendingMessage]);

  const conversationsByUser = conversations.filter((item) =>
    item.participants.some(
      (participant) =>
        participant.participantId !== localStorage.getItem("userId")
    )
  );

  const getUserDetails = async (participantId) => {
    try {
      const response = await getAllUser();
      const user = [...response.students, ...response.tutors].find(
        (u) => u._id === participantId
      );
      return user ? user : { firstname: "Unknown", lastname: "" };
    } catch (error) {
      console.error("Error fetching user details:", error);
      return { firstname: "Unknown", lastname: "" };
    }
  };

  const handleSelectConversation = async (conversationId) => {
    setCurrentConversationId(conversationId);
    try {
      const data = await getConversationById(conversationId);
      const formattedMessages = data.messages.flatMap((msg) =>
        msg.contents.map((content) => ({
          senderId: msg.senderId,
          content: content.content,
          timestamp: content.timestamp,
        }))
      );
      const otherParticipant = data.participants.find(
        (participant) => participant.participantId !== userId
      );
      const otherParticipantId = otherParticipant
        ? otherParticipant.participantId
        : null;
      setOtherParticipantId(otherParticipantId); // tìm id người còn lại
      // Sắp xếp tin nhắn theo thời gian (cũ đến mới)
      setMessages(
        formattedMessages.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        )
      );
    } catch (error) {
      console.error("Error loading conversation messages:", error);
    }
  };

  const handleSendMessage = async (newMessage) => {
    if (newMessage.trim() === "") return;

    const newMsg = {
      conversationId: currentConversationId,
      senderId: userId,
      senderModel: senderModel,
      content: newMessage,
      timestamp: dayjs().format("DD/MM/YYYY HH:mm"),
    };

    try {
      setSendingMessage(true);
      await sendMessage(
        newMsg.conversationId,
        newMsg.senderId,
        newMsg.senderModel,
        newMsg.content
      );
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, newMsg].sort(
          (a, b) =>
            dayjs(a.timestamp, "DD/MM/YYYY HH:mm") -
            dayjs(b.timestamp, "DD/MM/YYYY HH:mm")
        );
        return updatedMessages;
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleOpenUserModal = () => {
    setIsAddConversationModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setIsAddConversationModalOpen(false);
  };

  return (
    <Content style={stylesInline.content}>
      <Flex gap="middle">
        {/* Danh sách cuộc trò chuyện */}

        <UserList
          conversationsByUser={conversationsByUser}
          onSelectConversation={handleSelectConversation}
          onOpenUserModal={handleOpenUserModal}
          isLoading={isLoading}
          fetchConversations={fetchConversations}
        />
        <ChatBox
          messages={messages}
          onSendMessage={handleSendMessage}
          otherParticipantId={otherParticipantId}
        />
      </Flex>

      {/* Modal chọn user */}
      <ModalCreateConversation
        isOpen={isAddConversationModalOpen}
        onCancel={handleCloseUserModal}
        conversationsByUser={conversationsByUser}
        fetchConversations={fetchConversations}
      />
    </Content>
  );
}

const stylesInline = {
  content: {
    padding: "1rem",
  },
};

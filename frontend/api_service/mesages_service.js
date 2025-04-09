import axios from "axios";
import io from "socket.io-client";

const socket = io("https://etutoring-1640-1.onrender.com", {
  transports: ["websocket"], // Đảm bảo sử dụng websocket
});

const API_URL = "https://etutoring-1640-1.onrender.com";

// Hàm lấy tất cả các tin nhắn trong hệ thống
export const getAllMessages = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/messages/messages/all`, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("All messages fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all messages:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAllConversations = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/messages/conversations`, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("All conversations fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all conversations:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Hàm lấy một đoạn chat theo ID
export const getConversationById = async (conversationId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/messages/conversations/${conversationId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

// Hàm lấy tất cả đoạn chat theo userId và userModel
export const getConversations = async (userId, userModel) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/messages/conversations/${userId}/${userModel}`,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching conversations:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAllUser = async () => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/viewListUser`);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const sendMessage = async (
  conversationId,
  senderId,
  senderModel,
  content
) => {
  try {
    const message = {
      conversationId,
      senderId,
      senderModel,
      content,
    };

    // Gửi tin nhắn lên server thông qua API
    const response = await axios.post(
      `${API_URL}/api/messages/messages`,
      message,
      { headers: { "Content-Type": "application/json" } }
    );

    // Phát sự kiện `sendMessage` lên server
    socket.emit("sendMessage", message);

    return response.data;
  } catch (error) {
    console.error(
      "Error sending message:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const listenForMessages = (callback) => {
  socket.on("receiveMessage", (message) => {
    console.log("New message received:", message);
    callback(message); // Gọi callback khi nhận được tin nhắn
  });
};

export const createConversations = async (participants) => {
  try {
    // Kiểm tra participants có phải là mảng và có phần tử không
    if (!Array.isArray(participants) || participants.length === 0) {
      throw new Error("Participants must be a non-empty array.");
    }

    // Đảm bảo mỗi participant có participantId và participantModel
    participants.forEach((p, index) => {
      if (!p.participantId || !p.participantModel) {
        throw new Error(
          `Participant at index ${index} is missing participantId or participantModel.`
        );
      }
    });

    // Gửi request tạo cuộc trò chuyện
    const response = await axios.post(
      `${API_URL}/api/messages/createconversations`,
      { participants }, // Truyền trực tiếp participants theo đúng format
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("Conversation created:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating conversation:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Hàm xóa thành viên khỏi cuộc trò chuyện
export const removeConversations = async (
  conversationId,
  participantId,
  participantModel
) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/messages/conversations/${conversationId}/participants`,
      {
        data: { participantId, participantModel }, // Gửi dữ liệu bằng "data" khi dùng DELETE
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("Participant removed successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error removing participant:",
      error.response?.data || error.message
    );
    throw error;
  }
};

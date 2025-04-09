import axios from "axios";

const API_URL = "https://etutoring-1640-1.onrender.com";

// Tạo bình luận mới cho tài liệu
export const createCommentDocument = async (documentId, commentData) => {
  try {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const authorType = localStorage.getItem("role");
    const formattedAuthorType =
      authorType.charAt(0).toUpperCase() + authorType.slice(1).toLowerCase();

    if (!userId || !token || !authorType)
      throw new Error("Thông tin người dùng không hợp lệ!");

    const response = await axios.post(
      `${API_URL}/api/commentdocument/document`,
      {
        content: commentData,
        documentId,
        authorId: userId,
        authorType: formattedAuthorType,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Lỗi khi tạo bình luận:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Lấy danh sách bình luận của một tài liệu
export const getCommentsByDocument = async (documentId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/commentdocument/document/${documentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bình luận:", error);
    throw error;
  }
};

// Chỉnh sửa bình luận của tài liệu
export const editCommentDocument = async (commentId, updatedContent) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) throw new Error("Người dùng chưa đăng nhập!");

    const response = await axios.put(
      `${API_URL}/api/commentdocument/document/${commentId}`,
      { content: updatedContent },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Lỗi khi chỉnh sửa bình luận:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Xóa bình luận của tài liệu
export const deleteCommentDocument = async (commentId) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) throw new Error("Người dùng chưa đăng nhập!");

    const response = await axios.delete(
      `${API_URL}/api/commentdocument/document/${commentId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Lỗi khi xóa bình luận:",
      error.response?.data || error.message
    );
    throw error;
  }
};

import axios from "axios";

const API_URL = "https://etutoring-1640-1.onrender.com";

// Tạo bình luận mới
export const createComment = async (blogId, commentData) => {
    try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        const authorType = localStorage.getItem("role");
        const formattedAuthorType = authorType.charAt(0).toUpperCase() + authorType.slice(1).toLowerCase();


        if (!userId || !token || !authorType) throw new Error("Thông tin người dùng không hợp lệ!");

        // Fix: Use authorId instead of userId to match backend expectation
        const response = await axios.post(
            `${API_URL}/api/comment/comments`,
            { ...commentData, blogId, authorId: userId, authorType: formattedAuthorType},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        console.error("Error creating comment:", error.response?.data || error.message);
        throw error;
    }
};


// Lấy danh sách bình luận của một bài blog
export const getComments = async (blogId) => {
    try {
        const response = await axios.get(`${API_URL}/api/comment/comments/${blogId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching comments:", error);
        throw error;
    }
};

// Chỉnh sửa bình luận
export const editComment = async (commentId, updatedContent) => {
    try {
        const token = localStorage.getItem("token");

        if (!token) throw new Error("Người dùng chưa đăng nhập!");

        const response = await axios.put(
            `${API_URL}/api/comment/comments/${commentId}`,
            { content: updatedContent },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        console.error("Error editing comment:", error.response?.data || error.message);
        throw error;
    }
};

// Xóa bình luận
export const deleteComment = async (commentId) => {
    try {
        const token = localStorage.getItem("token");

        if (!token) throw new Error("Người dùng chưa đăng nhập!");

        const response = await axios.delete(`${API_URL}/api/comment/comments/${commentId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting comment:", error.response?.data || error.message);
        throw error;
    }
};

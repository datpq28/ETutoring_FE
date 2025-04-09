import axios from "axios";

const API_URL = "https://etutoring-1640-1.onrender.com";

export const createBlog = async (blogData) => {
  try {
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    if (!userId || !role) {
      throw new Error("User information is missing. Please log in again.");
    }

    const response = await axios.post(`${API_URL}/api/blog/blogs`, {
      ...blogData,
      uploaderId: userId,
      uploaderType: role, // Lấy role từ localStorage
    });

    return response.data;
  } catch (error) {
    console.error("Error creating blog:", error);
    throw error;
  }
};

// Lấy danh sách blog
export const getBlogs = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/blog/blogs`);
    return response.data;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    throw error;
  }
};

// Lấy bài blog theo ID
export const getBlogById = async (blogId) => {
  try {
    const response = await axios.get(`${API_URL}/api/blog/blogs/${blogId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching blog by ID:", error);
    throw error;
  }
};

// Sửa bài blog
export const editBlog = async (blogId, blogData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `${API_URL}/api/blog/blogs/${blogId}`,
      blogData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error editing blog:", error);
    throw error;
  }
};

export const likeBlog = async (blogId) => {
  try {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) throw new Error("Người dùng chưa đăng nhập!");

    const response = await axios.post(
      `${API_URL}/api/blog/blogs/${blogId}/like`,
      { userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error liking blog:", error.response?.data || error.message);
    throw error;
  }
};

export const unlikeBlog = async (blogId) => {
  try {
    const userId = localStorage.getItem("userId"); // ✅ Lấy userId từ localStorage
    const token = localStorage.getItem("token");

    if (!userId || !token) throw new Error("Người dùng chưa đăng nhập!");

    const response = await axios.post(
      `${API_URL}/api/blog/blogs/${blogId}/unlike`,
      { userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error unliking blog:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Xóa bài blog
export const deleteBlog = async (blogId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${API_URL}/api/blog/blogs/${blogId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting blog:", error);
    throw error;
  }
};

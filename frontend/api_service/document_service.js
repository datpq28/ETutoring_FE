import axios from "axios";

const API_URL = "https://etutoring-1640-1.onrender.com";

export const createDocument = async (documentData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Unauthorized: No token provided.");
    }

    const formData = new FormData();
    formData.append("title", documentData.get("title"));
    formData.append("description", documentData.get("description"));
    formData.append("subject", documentData.get("subject"));
    formData.append("uploadedBy", documentData.get("uploadedBy"));
    if (documentData.get("file") !== null) {
      formData.append("file", documentData.get("file"));
    }

    const response = await axios.post(
      `${API_URL}/api/document/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
};

export const getDocuments = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/api/document/documents`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

export const getDocumentById = async (documentId) => {
  try {
    const response = await axios.get(`${API_URL}/api/document/${documentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching document by ID:", error);
    throw error;
  }
};

export const editDocument = async (documentId, documentData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Unauthorized: No token provided.");
    }

    const formData = new FormData();
    formData.append("title", documentData.get("title"));
    formData.append("description", documentData.get("description"));
    formData.append("subject", documentData.get("subject"));
    formData.append("file", documentData.get("file"));
    console.log('documentData.get("file")', documentData.get("file"));

    const response = await axios.put(
      `${API_URL}/api/document/${documentId}/edit`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error editing document:", error, documentData.get("file"));
    throw error;
  }
};

export const deleteDocument = async (documentId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Unauthorized: No token provided.");
    }

    const response = await axios.delete(
      `${API_URL}/api/document/${documentId}/delete`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};

export const downloadDocument = async (documentId, fileName) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Unauthorized: No token provided.");
    }

    const response = await axios.get(
      `${API_URL}/api/document/${documentId}/download`, // ✅ Sửa URL cho đúng chuẩn
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // 🛑 Đảm bảo nhận dữ liệu dạng file nhị phân
      }
    );
    // 🛑 Kiểm tra phản hồi từ server
    if (!response.data || response.data.size === 0) {
      throw new Error("Downloaded file is empty or invalid.");
    }

    // 📌 Kiểm tra loại dữ liệu trả về
    console.log("Response Content-Type:", response.headers["content-type"]);

    // 🏗️ Tạo blob với Content-Type chính xác từ backend
    const blob = new Blob([response.data], {
      type: response.headers["content-type"],
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName || "document.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url); // 🗑️ Giải phóng bộ nhớ

    return true;
  } catch (error) {
    console.error("Error downloading document:", error);
    throw error;
  }
};

// export const downloadDocument = async (documentId, fileName) => {
//   try {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       throw new Error("Unauthorized: No token provided.");
//     }

//     const response = await axios.get(
//       `${API_URL}/api/document/${documentId}/download`,
//       {
//         headers: { Authorization: `Bearer ${token}` },
//         responseType: "blob",
//       }
//     );

//     const suggestedFileName = fileName || "document.pdf";
//     const url = window.URL.createObjectURL(new Blob([response.data]));
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute("download", suggestedFileName);
//     document.body.appendChild(link);
//     link.click();
//     link.remove();

//     return response.data;
//   } catch (error) {
//     console.error("Error downloading document:", error);
//     throw error;
//   }
// };

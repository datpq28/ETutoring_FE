import { notification } from "antd";
import axios from "axios";

const API_URL = "https://etutoring-1640-1.onrender.com";

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/loginUser`, {
      email,
      password,
    });

    const { token, role, userId } = response.data;

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", userId);
    }

    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found. User may already be logged out.");
    }

    await axios.post(
      `${API_URL}/api/auth/logoutUser`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");

    return { message: "Logout successful" };
  } catch (error) {
    console.error("Error during logout:", error?.response?.data || error);
    throw error;
  }
};

export const registerVerifyOTP = async (email, otp) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/registerVerifyOTP`, {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    console.error("Error verify OTP:", error);
    throw error;
  }
};

export const registerSendOTP = async (
  firstname,
  lastname,
  email,
  password,
  role,
  description,
  filed,
  blogId
) => {
  console.log("Data before sending API:", {
    firstname,
    lastname,
    email,
    password,
    role,
    description,
    filed,
    blogId,
  });

  try {
    const response = await axios.post(`${API_URL}/api/auth/registerSendOTP`, {
      firstname,
      lastname,
      email,
      password,
      role,
      description,
      filed,
      blogId,
    });
    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error during register:", error?.response?.data || error);
    throw error;
  }
};

export const approveAdmin = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/approveAdmin`);
    return response.data;
  } catch (error) {
    console.error("Error approving admin:", error);
    throw error;
  }
};

export const sendAdminApprovalRequest = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    notification.error({
      message: "Token is missing. Please log in again.",
      duration: 3,
    });
    console.error("Token is missing.");
    throw new Error("Token is required.");
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/auth/sendAdminApprovalRequest`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending admin approval request:", error);
    throw error;
  }
};

export const forgotPasswordSendOTP = async (email) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/forgotPasswordSendOTP`,
      {
        email,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const verifyOtpForgot = async (email, otp) => {
  try {
    console.log("Verifying OTP with data:", { email, otp });
    const response = await axios.post(`${API_URL}/api/auth/verifyOtp`, {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};

export const updatePassword = async (email, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/updatePassword`, {
      email,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};

export const updatePasswordLoggedIn = async (
  email,
  oldPassword,
  newPassword
) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No token found. Please log in again.");
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/auth/updatePasswordLoggedIn`,
      {
        email,
        oldPassword,
        newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error updating password (logged-in):",
      error?.response?.data || error
    );
    throw error;
  }
};

export const getInformationById = async (userId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/auth/getInformationById/${userId}`
    );

    const user = response.data.user;
    console.log("User Information:", user);

    return user;
  } catch (error) {
    console.error(
      "Error retrieving user information:",
      error?.response?.data || error
    );
    throw error;
  }
};

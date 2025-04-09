import axios from "axios";

const API_URL = "https://etutoring-1640-1.onrender.com";

export const getNotificationsByTutor = async (tutorId) => {
    try {
      const response = await fetch(`${API_URL}/api/notification/tutor/${tutorId}`);
      
      if (!response.ok) throw new Error("Error while getting notification list for tutor");
  
      const data = await response.json();
      return data || []; 
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  
  export const getNotificationsByStudent = async (studentId) => {
    try {
      const response = await fetch(`${API_URL}/api/notification/student/${studentId}`);
      
      if (!response.ok) throw new Error("Error while getting notification list for student");
  
      const data = await response.json();
      return data || []; 
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  export const markNotificationAsRead = async (notificationId) => {
    try {
        const response = await fetch(`${API_URL}/api/notification/${notificationId}/read`, {
            method: "PUT",
        });

        if (!response.ok) throw new Error("Error marking notification as read");

        return await response.json();
    } catch (error) {
        console.error(error);
    }
};
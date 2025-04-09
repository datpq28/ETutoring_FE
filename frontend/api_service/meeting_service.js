import axios from "axios";

const API_URL = "https://etutoring-1640-1.onrender.com";

export const fetchStudentsByTutor = async (tutorId) => {
    try {
      const response = await fetch(`${API_URL}/api/meeting/students/${tutorId}`);
      if (!response.ok) throw new Error("Error when getting student list");
  
      const data = await response.json();
      return data.students || []; 
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  
  export const createMeeting = async (meetingData) => {
    try {
      const response = await fetch(`${API_URL}/api/meeting/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meetingData),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error creating meeting");
  
      return data;
    } catch (error) {
      console.error(error);
      return { error: error.message };
    }
  };

  export const fetchMeetingsByTutor = async (tutorId) => {
    try {
      const response = await fetch(`${API_URL}/api/meeting/meetings/${tutorId}`);
      if (!response.ok) throw new Error("Error while getting meeting list");
  
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  export const fetchMeetingsByStudent = async (studentId) => {
    try {
      const response = await fetch(`${API_URL}/api/meeting/meetings/student/${studentId}`);
      if (!response.ok) {
        throw new Error(`Error while getting meeting list: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error("Error fetching meetings for student:", error);
      return [];
    }
  };
  
  export const fetchTutors = async () => {
    try {
      const response = await fetch(`${API_URL}/api/meeting/tutors`);
      if (!response.ok) throw new Error("Error getting tutor list");
  
      const data = await response.json();
      return data.tutors || [];
    } catch (error) {
      console.error("Error fetching tutors:", error);
      return [];
    }
  };
  
  export const fetchAllMeetings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/meeting/all`);
      if (!response.ok) throw new Error("Error while getting list of all meetings");
  
      return await response.json();
    } catch (error) {
      console.error("Error fetching all meetings:", error);
      return [];
    }
  };
  
  export const editMeeting = async (meetingId, updatedData) => {
    try {
      const response = await fetch(`${API_URL}/api/meeting/edit/${meetingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error editing meeting");
  
      return data;
    } catch (error) {
      console.error("Error editing meeting:", error);
      return { error: error.message };
    }
  };
  
  export const deleteMeeting = async (meetingId) => {
    try {
      const response = await fetch(`${API_URL}/api/meeting/delete/${meetingId}`, {
        method: "DELETE",
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error while deleting meeting");
  
      return data;
    } catch (error) {
      console.error("Error deleting meeting:", error);
      return { error: error.message };
    }
  };

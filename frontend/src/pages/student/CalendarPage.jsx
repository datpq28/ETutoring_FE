import { useState, useEffect } from "react";
import { Layout, Calendar, Badge, Card, Modal, List, Button, Menu, Dropdown } from "antd";
import dayjs from "dayjs";
import { BellOutlined } from "@ant-design/icons";
import { fetchMeetingsByStudent } from "../../../api_service/meeting_service";
import { getNotificationsByStudent, markNotificationAsRead } from "../../../api_service/notification_service";
import { useNavigate } from "react-router";
import { io } from "socket.io-client";

const socket = io("https://etutoring-1640-1.onrender.com");
const { Content } = Layout;

export default function CalendarPage() {
  const [meetings, setMeetings] = useState([]);
  const [selectedDateMeetings, setSelectedDateMeetings] = useState([]);
  const [isMeetingListVisible, setIsMeetingListVisible] = useState(false);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [storedStudentId, setStudentId] = useState(null);

  useEffect(() => {
    const storedStudentId = localStorage.getItem("userId");
    if (storedStudentId) {
      setStudentId(storedStudentId);
      loadMeetings(storedStudentId);
      loadNotifications(storedStudentId); 
    }

    socket.on("meeting_started", ({ meetingId }) => {
      setMeetings((prev) =>
        prev.map((m) => (m._id === meetingId ? { ...m, isLive: true } : m))
      );
    });

    return () => {
      socket.off("meeting_started");
    };
  }, []);

  const loadMeetings = async (studentId) => {
    const data = await fetchMeetingsByStudent(studentId);
    setMeetings(data); 
  };

  const loadNotifications = async (studentId) => {
    try {
      const notifications = await getNotificationsByStudent(studentId); 
      setNotifications(notifications || []); // Ensure notifications is always an array
      const unreadCount = notifications.filter((notif) => !notif.isRead).length; // Calculate unread count
      setUnreadCount(unreadCount);
      console.log("Notifications loaded:", notifications);
      console.log("Unread count loaded:", unreadCount);
    } catch (error) {
      console.error("Error loading notifications for student:", error);
      setNotifications([]); // Reset to empty array on error
      setUnreadCount(0); // Reset unread count on error
    }
  };

  const handleNotificationClick = async (notif) => {
    if (notif.isRead) return; // If already read, do nothing

    // Decrease unread count immediately
    setUnreadCount((prev) => Math.max(prev - 1, 0));

    // Update notification state immediately
    setNotifications((prev) =>
      prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
    );

    try {
      await markNotificationAsRead(notif._id);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };


  const handleJoinMeeting = (meetingId) => {
    navigate(`/student/meeting/${meetingId}`);
  };


  const dateCellRender = (value) => {
    const formattedDate = value.format("YYYY-MM-DD");
    const meetingsOnThisDay = meetings.filter(
      (meeting) => dayjs(meeting.startTime).format("YYYY-MM-DD") === formattedDate
    );

    return (
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          cursor: meetingsOnThisDay.length > 0 ? "pointer" : "default",
        }}
        onClick={() => {
          if (meetingsOnThisDay.length > 0) {
            setSelectedDateMeetings(meetingsOnThisDay);
            setIsMeetingListVisible(true);
          }
        }}
      >
        {meetingsOnThisDay.map((meeting) => (
          <li key={meeting._id}>
            <Badge
              status={meeting.isLive ? "success" : "processing"}
              text={`${meeting.name} (${dayjs(meeting.startTime).format("HH:mm")} - ${dayjs(meeting.endTime).format("HH:mm")})`}
            />
          </li>
        ))}
      </ul>
    );
  };

  const notificationMenu = (
    <Menu
      style={{
        width: 320,
        maxHeight: 400,
        overflowY: "auto",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Menu.Item
        style={{
          fontWeight: "bold",
          textAlign: "center",
          background: "#f0f2f5",
        }}
      >
       Notification
      </Menu.Item>
      {(notifications || []).length > 0 ? (
        notifications.map((notif, index) => (
          <Menu.Item
            key={notif._id || `notif-${index}`} // Use notif._id or fallback to index
            onClick={() => !notif.isRead && handleNotificationClick(notif)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: notif.isRead ? "#f0f2f5" : "#ffffff",
              fontWeight: notif.isRead ? "normal" : "bold",
              padding: "10px",
              borderBottom: "1px solid #e0e0e0",
              cursor: notif.isRead ? "default" : "pointer",
            }}
          >
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0 }}>{notif.text}</p>
              <small style={{ color: "#888" }}>{dayjs(notif.time).fromNow()}</small>
            </div>
          </Menu.Item>
        ))
      ) : (
        <Menu.Item
          style={{
            textAlign: "center",
            padding: "12px",
            color: "#888",
          }}
        >
          No notification
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <Content style={{ padding: "2rem" }}>
      <Layout.Header style={{ display: "flex", justifyContent: "flex-end", padding: "0 20px", background: "#fff" }}>
        <Dropdown overlay={notificationMenu} trigger={["click"]}>
          <Badge count={unreadCount} style={{ backgroundColor: "#f5222d" }}>
            <BellOutlined style={{ fontSize: "24px", cursor: "pointer" }} />
          </Badge>
        </Dropdown>
      </Layout.Header>
      <Card>
        <Calendar dateCellRender={dateCellRender} />
      </Card>

      {/* List of meetings by day method */}
      <Modal
        title="List of meetings"
        open={isMeetingListVisible}
        onCancel={() => setIsMeetingListVisible(false)}
        footer={null}
      >
        <List
          itemLayout="vertical"
          dataSource={selectedDateMeetings}
          renderItem={(meeting) => (
            <List.Item key={meeting._id}>
              <h3>{meeting.name}</h3>
              <p>
                <strong>Time:</strong>{" "}
                {dayjs(meeting.startTime).format("HH:mm")} -{" "}
                {dayjs(meeting.endTime).format("HH:mm")}
              </p>
              <p>
                <strong>Description:</strong> {meeting.description || "No description"}
              </p>
              <p>
                <strong>Tutor:</strong> {meeting.tutorId?.firstname}{" "}
                {meeting.tutorId?.lastname}
              </p>

              {/*"Join Call" button if the meeting is live */}
              {meeting.isLive && (
                <Button type="primary" onClick={() => handleJoinMeeting(meeting._id)}>
                  Join Call
                </Button>
              )}
            </List.Item>
          )}
        />
      </Modal>
    </Content>
  );
}

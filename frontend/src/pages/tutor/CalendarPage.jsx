import { useState, useEffect, useCallback } from "react";
import { Layout, Calendar, Badge, Card, Modal, List, notification, Dropdown, Menu } from "antd";
import { BellOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { fetchMeetingsByTutor } from "../../../api_service/meeting_service";
import { getNotificationsByTutor, markNotificationAsRead } from "../../../api_service/notification_service";
import { useNavigate } from "react-router";
import { io } from "socket.io-client";

dayjs.extend(relativeTime);

const socket = io("http://localhost:5090");
const { Content } = Layout;

export default function CalendarPage() {
  const [isMeetingListVisible, setIsMeetingListVisible] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [selectedDateMeetings, setSelectedDateMeetings] = useState([]);
  const [role, setRole] = useState(null);
  const [tutorId, setTutorId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const loadInitialData = useCallback(async (tutorId) => {
    if (tutorId) {
      const meetingsData = await fetchMeetingsByTutor(tutorId);
      setMeetings(meetingsData.filter((meeting) => meeting.tutorId._id === tutorId));
      loadNotifications(tutorId);
    }
  }, []);

  const loadNotifications = useCallback(async (tutorId) => {
    if (tutorId) {
      const { notifications: newNotifications, unreadCount: newUnreadCount } = await getNotificationsByTutor(tutorId);
      if (
        JSON.stringify(newNotifications) !== JSON.stringify(notifications) ||
        newUnreadCount !== unreadCount
      ) {
        setNotifications(newNotifications);
        setUnreadCount(newUnreadCount);
      }
    }
  }, [notifications, unreadCount]);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedTutorId = localStorage.getItem("userId");

    if (storedRole === "tutor" && storedTutorId) {
      setRole("tutor");
      setTutorId(storedTutorId);
      loadInitialData(storedTutorId);
      socket.emit("register_user", { tutorId: storedTutorId, role: storedRole });

      const notificationInterval = setInterval(() => {
        loadNotifications(storedTutorId);
      }, 5000); // Fetch notifications every 5 seconds

      return () => {
        clearInterval(notificationInterval);
        socket.off("new-notification");
        socket.off("new-meeting");
        socket.off("meeting-created-by-admin");
      };
    }
  }, [loadInitialData, loadNotifications]);

  useEffect(() => {
    if (!tutorId) return;

    socket.on("new-notification", (data) => {
      if (data.tutorId === tutorId) {
        loadNotifications(tutorId); // Tự động cập nhật danh sách thông báo
        notification.info({
          message: "Thông báo mới",
          description: data.message || "Bạn có thông báo mới",
          duration: 3,
          onClick: () => navigate(`/tutor/meeting/${data.meetingId}`),
        });
      }
    });

    socket.on("new-meeting", (data) => {
      if (data.type === "tutor" && data.tutorId === tutorId) {
        setNotifications((prev) => [...prev, data]);
        setUnreadCount((prev) => prev + 1);
        notification.info({
          message: "Cuộc họp mới",
          description: data.message,
          onClick: () => navigate(`/tutor/meeting/${data.meetingId}`),
        });
      }
    });

    socket.on("meeting-created-by-admin", (data) => {
      setMeetings((prev) => [...prev, data.meeting]);
      notification.info({
        message: "Cuộc họp từ Admin",
        description: `Cuộc họp "${data.meeting.name}" đã được tạo bởi Admin`,
        onClick: () => navigate(`/meeting/${data.meeting._id}`),
      });
    });

    return () => {
      socket.off("new-notification");
      socket.off("new-meeting");
      socket.off("meeting-created-by-admin");
    };
  }, [tutorId, navigate, loadNotifications]);

  const handleStartMeeting = (meeting) => {
    if (!meeting || !meeting._id) return;
    socket.emit("start_call", { meetingId: meeting._id, tutorId: meeting.tutorId });
    navigate(`/tutor/meeting/${meeting._id}`);
  };

  const handleNotificationClick = async (notif) => {
    if (notif.isRead) return;

    setUnreadCount((prev) => Math.max(prev - 1, 0));
    setNotifications((prev) =>
      prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
    );

    try {
      await markNotificationAsRead(notif._id);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const dateCellRender = (value) => {
    const formattedDate = value.format("YYYY-MM-DD");
    const meetingsOnThisDay = meetings.filter(
      (meeting) => dayjs(meeting.startTime).format("YYYY-MM-DD") === formattedDate
    );

    return (
      <ul
        style={{ listStyle: "none", padding: 0, cursor: meetingsOnThisDay.length > 0 ? "pointer" : "default" }}
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
              status="processing"
              text={`${meeting.name} (${dayjs(meeting.startTime).format("HH:mm")} - ${dayjs(meeting.endTime).format("HH:mm")})`}
            />
          </li>
        ))}
      </ul>
    );
  };

  const notificationMenu = (
    <Menu style={{ width: 320, maxHeight: 400, overflowY: "auto", borderRadius: 8 }}>
      <Menu.Item style={{ fontWeight: "bold", textAlign: "center", background: "#f0f2f5" }}>
        Thông báo
      </Menu.Item>
      {notifications.length > 0 ? (
        notifications.map((notif) => (
          <Menu.Item
            key={notif._id}
            onClick={() => handleNotificationClick(notif)}
            style={{
              backgroundColor: notif.isRead ? "#f0f2f5" : "#fff",
              fontWeight: notif.isRead ? "normal" : "bold",
              padding: "10px",
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <div>
              <p style={{ margin: 0 }}>{notif.text}</p>
              <small style={{ color: "#888" }}>{dayjs(notif.time).fromNow()}</small>
            </div>
          </Menu.Item>
        ))
      ) : (
        <Menu.Item style={{ textAlign: "center", color: "#888" }}>Không có thông báo</Menu.Item>
      )}
    </Menu>
  );

  return (
    <Content style={{ padding: "2rem" }}>
      <Layout.Header style={{ display: "flex", justifyContent: "flex-end", background: "#fff" }}>
        <Dropdown overlay={notificationMenu} trigger={["click"]}>
          <Badge count={unreadCount} style={{ backgroundColor: "#f5222d" }}>
            <BellOutlined style={{ fontSize: "24px", cursor: "pointer" }} />
          </Badge>
        </Dropdown>
      </Layout.Header>

      <Card>
        <Calendar dateCellRender={dateCellRender} />
      </Card>

      <Modal
        title="Danh sách cuộc họp"
        open={isMeetingListVisible}
        onCancel={() => setIsMeetingListVisible(false)}
        footer={null}
      >
        <List
          itemLayout="vertical"
          dataSource={selectedDateMeetings}
          renderItem={(meeting) => {
            const today = dayjs().startOf("day");
            const tomorrow = today.add(1, "day");
            const meetingDate = dayjs(meeting.dayOfWeek).startOf("day");

            return (
              <List.Item key={meeting._id}>
                <h3>{meeting.name}</h3>
                <p><strong>Thời gian:</strong> {dayjs(meeting.startTime).format("HH:mm")} - {dayjs(meeting.endTime).format("HH:mm")}</p>
                <p><strong>Mô tả:</strong> {meeting.description || "Không có mô tả"}</p>
                <p>
                  <strong>Học sinh:</strong>{" "}
                  {Array.isArray(meeting.studentIds)
                    ? meeting.studentIds.map((student) => `${student.firstname} ${student.lastname}`).join(", ")
                    : "Không có dữ liệu"}
                </p>
                {meetingDate.isBefore(today) && (
                  <button disabled style={{ backgroundColor: "gray", color: "#fff", padding: "8px 16px" }}>
                    Attended
                  </button>
                )}
                {meetingDate.isSame(today) && role === "tutor" && (
                  <button onClick={() => handleStartMeeting(meeting)} style={{ backgroundColor: "green", color: "#fff", padding: "8px 16px" }}>
                    Start Meeting
                  </button>
                )}
                {meetingDate.isAfter(today) && (
                  <button disabled style={{ backgroundColor: "blue", color: "#fff", padding: "8px 16px" }}>
                    Is Coming
                  </button>
                )}
              </List.Item>
            );
          }}
        />
      </Modal>
    </Content>
  );
}

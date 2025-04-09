import { useEffect, useState } from "react";
import { Layout, Table, Button, notification, Tag } from "antd";
import { fetchAllMeetings, updateMeetingStatus } from "../../../api_service/admin_service";
import dayjs from "dayjs";

const { Content } = Layout;

export default function MeetingManagementPage() {
  const [meetings, setMeetings] = useState([]);
  const now = dayjs(); // Get the current time in Hanoi

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const data = await fetchAllMeetings();
      const sortedMeetings = data.sort((a, b) => dayjs(b.startTime).valueOf() - dayjs(a.startTime).valueOf());
      setMeetings(sortedMeetings);
    } catch (error) {
      notification.error({ message: "Unable to load meeting list" });
    }
  };

  const columns = [
    { title: "Meeting name", dataIndex: "name" },
    {
      title: "Tutor",
      dataIndex: "tutorId",
      render: (tutor) => tutor ? `${tutor.firstname} ${tutor.lastname}` : "Unknown",
    },
    {
      title: "Time",
      render: (_, record) =>
        `${dayjs(record.startTime).format("HH:mm")} - ${dayjs(record.endTime).format("HH:mm")} (${dayjs(record.startTime).format("DD/MM/YYYY")})`,
    },
    { title: "Description", dataIndex: "description", render: (text) => text || "No description" },
    {
      title: "Status",
      render: (_, record) => {
        const startTime = dayjs(record.startTime);
        if (startTime.isBefore(now, 'day')) {
          return <Tag color="gray">Attended</Tag>;
        } else if (startTime.isSame(now, 'day')) {
          return <Tag color="green">Studying</Tag>;
        } else {
          return <Tag color="blue">IsComing</Tag>;
        }
      },
    },
  ];

  return (
    <Content style={{ padding: "2rem" }}>
      <h2>Meeting Management</h2>
      <Table dataSource={meetings} rowKey="_id" columns={columns} />
    </Content>
  );
}
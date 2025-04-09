import { CalendarOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Divider, Flex, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import { fetchMeetingsByTutor } from "../../../../api_service/meeting_service";
import LoadingSection from "../../common/LoadingSection";
import { formatTime, showTime } from "../../../utils/Date";
import { useNavigate } from "react-router";

const { Title, Text } = Typography;
const userId = localStorage.getItem("userId");

export default function UpcomingMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  let navigate = useNavigate();
  useEffect(() => {
    const getMeetings = async () => {
      const data = await fetchMeetingsByTutor(userId);
      console.log(data, data);
      if (data) {
        const threeMeeting = getThreeClosestUpcomingGroups(data, new Date());
        setMeetings(threeMeeting);
      }
      setLoading(false);
    };
    getMeetings();
  }, []);
  return (
    <>
      {loading ? (
        <LoadingSection length={3} />
      ) : (
        <Card
          title={
            <Flex vertical gap="small">
              <Title level={3} style={{ margin: 0 }}>
                Upcoming Meetings
              </Title>
              <Text level={5} style={{ margin: 0, color: "#7b889c" }}>
                Your scheduled meetings
              </Text>
            </Flex>
          }
          classNames={{
            header: "my-card",
          }}
          styles={{
            header: {
              color: "white",
              width: "100%",
              paddingTop: "1.6rem",
              paddingBottom: "1.6rem",
            },
          }}
          extra={
            <Button
              color="default"
              variant="filled"
              icon={<CalendarOutlined />}
              onClick={() => navigate("/tutor/calendar")}
            >
              View All
            </Button>
          }
        >
          <Flex vertical gap="middle">
            {meetings.map((item) => {
              return (
                <MeetingItem
                  key={item._id}
                  date={formatTime(item.startTime)}
                  timeStart={showTime(item.startTime)}
                  timeEnd={showTime(item.endTime)}
                  name={item.name}
                  id={item._id}
                />
              );
            })}
          </Flex>
        </Card>
      )}
    </>
  );
}

function MeetingItem({
  name = "Weekly Check-in",
  timeStart = "10:10 AM",
  timeEnd = "10:10 AM",
  date = "Tomorrow",
  id = "1",
}) {
  let navigate = useNavigate();

  return (
    <Card>
      <Flex vertical gap="middle">
        <Flex justify="space-between" align="center">
          <Title level={4} style={{ margin: 0 }}>
            {name}
          </Title>
          <Avatar
            size={40}
            src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${id}`}
          />
        </Flex>
        <Space>
          <Flex gap="small">
            <CalendarOutlined />
            <Text level={5} style={{ margin: 0 }}>
              {date}
            </Text>
          </Flex>
          <Divider type="vertical" />
          <Text level={5} style={{ margin: 0 }}>
            {timeStart}
          </Text>
          <Divider type="vertical" />
          <Text level={5} style={{ margin: 0, color: "#1677ff" }}>
            {timeEnd}
          </Text>
        </Space>
        <Flex gap="middle">
          {/* <Button type="primary">Join Meeting</Button> */}
          <Button
            color="default"
            variant="filled"
            onClick={() => navigate("/tutor/calendar")}
          >
            View Details
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}

function getThreeClosestUpcomingGroups(groups, currentDate = new Date()) {
  // Create a new array to avoid modifying the original
  return (
    groups
      // Filter to include only future events
      .filter((group) => {
        const startTime = new Date(group.startTime);
        return startTime > currentDate;
      })
      // Map each group to include its time difference from today
      .map((group) => {
        const startTime = new Date(group.startTime);
        // Calculate time difference in milliseconds (only future events)
        const timeDifference = startTime - currentDate;
        return { ...group, timeDifference };
      })
      // Sort by time difference (ascending) to get closest future events first
      .sort((a, b) => a.timeDifference - b.timeDifference)
      // Take the first three items
      .slice(0, 3)
      // Remove the added timeDifference property
      .map(({ timeDifference, ...group }) => group)
  );
}

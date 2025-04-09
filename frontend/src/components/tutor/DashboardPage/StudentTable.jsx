import { CalendarOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Table, Typography } from "antd";
import { useEffect, useState } from "react";
import { viewListStudentByTutor } from "../../../../api_service/admin_service";

const { Title, Text } = Typography;
const userId = localStorage.getItem("userId");

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
  },
];

export default function StudentTable() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const students = await viewListStudentByTutor(userId);
      console.log("students", students);
      setStudents(students);
    };
    fetchStudents();
  }, []);

  const dataSource = students.map((student, index) => ({
    key: student._id || index,
    name: `${student.firstname} ${student.lastname}`,
    email: student.email || "N/A",
    address: student.address || "N/A",
  }));

  return (
    <Card
      title={
        <Flex vertical gap="small">
          <Title level={3} style={{ margin: 0 }}>
            Your students
          </Title>
          <Text level={5} style={{ margin: 0, color: "#7b889c" }}>
            You have {students.length} students in your class.
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
        <Button color="default" variant="filled" icon={<CalendarOutlined />}>
          View All
        </Button>
      }
    >
      <Table dataSource={dataSource} columns={columns} />
    </Card>
  );
}

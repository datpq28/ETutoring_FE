import {
  DeleteTwoTone,
  ImportOutlined,
  LockTwoTone,
  TeamOutlined,
  ToolOutlined,
  UnlockTwoTone,
  UserAddOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Flex,
  Input,
  Layout,
  Segmented,
  Space,
  Table,
  Tag,
  Typography,
  message,
  Modal,
  Select,
} from "antd";
import { useState, useEffect } from "react";
import AddUserModal from "../../components/admin/AccountsManagementPage/AddUserModal.jsx";
import {
  viewListUser,
  lockUser,
  unLockUser,
  deleteUser,
  assignTutorToStudentAll,
} from "../../../api_service/admin_service.js";

const { Content } = Layout;
const { Text } = Typography;

export default function AccountsManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [segmented, setSegmented] = useState("allUsers");
  const [users, setUsers] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const { Option } = Select;

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);

  const showModal = () => setIsModalOpen(true);
  const hideModal = () => setIsModalOpen(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await viewListUser();
        console.log("Data from API:", data);
        const allUsers = [...data.students, ...data.tutors];
        const mappedUsers = allUsers.map((user) => ({
          ...user,
          name: `${user.firstname} ${user.lastname}`,
          status: user.isLocked ? "locked" : "active",
          role: user.role === "student" ? "student" : "tutor",
          _id: user._id, // Add _id to each user object
        }));
        setUsers(mappedUsers);
        setStudents(data.students);
        setTutors(data.tutors);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleLock = async (email) => {
    try {
      await lockUser(email);
      message.success("User locked successfully");
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.email === email
            ? { ...user, isLocked: true, status: "locked" }
            : user
        )
      );
    } catch (error) {
      message.error("Failed to lock user");
    }
  };

  const handleUnlock = async (email) => {
    try {
      await unLockUser(email);
      message.success("User unlocked successfully");
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.email === email
            ? { ...user, isLocked: false, status: "active" }
            : user
        )
      );
    } catch (error) {
      message.error("Failed to unlock user");
    }
  };

  const handleDeleteUser = (email) => {
    Modal.confirm({
      title: "Are you sure?",
      content:
        "Do you really want to delete this user? This action cannot be undone.",
      okText: "Yes, delete",
      cancelText: "Cancel",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteUser(email);
          message.success("User deleted successfully");
          setUsers((prevUsers) =>
            prevUsers.filter((user) => user.email !== email)
          );
        } catch (error) {
          message.error("Failed to delete user");
        }
      },
    });
  };

  const handleOpenAssignModal = () => {
    setIsAssignModalOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedTutor || selectedStudents.length === 0) {
      message.warning("Please select a tutor and at least one student.");
      return;
    }
    try {
      const studentIds = selectedStudents
        .map((email) => {
          const student = students.find((s) => s.email === email);
          return student ? student._id : null;
        })
        .filter((id) => id !== null);

      const tutor = tutors.find((t) => t.email === selectedTutor);
      const tutorId = tutor ? tutor._id : null;

      if (tutorId === null) {
        message.error("Tutor ID not found.");
        return;
      }
      await assignTutorToStudentAll(studentIds, tutorId);
      message.success("Students assigned successfully!");
      setIsAssignModalOpen(false);
      setSelectedStudents([]);
      setSelectedTutor(null);
    } catch (error) {
      message.error("Failed to assign students.");
    }
  };

  const filteredData = users.filter((item) => {
    const matchesSegmented =
      segmented === "allUsers" ||
      (segmented === "students" && item.role === "student") ||
      (segmented === "tutors" && item.role === "tutor") ||
      (segmented === "admin" && item.role === "admin") ||
      (segmented === "requests" && item.status === "pending");
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchValue.toLowerCase());
    return matchesSegmented && (searchValue === "" || matchesSearch);
  });

  const segmentedOptions = [
    { label: "All Users", value: "allUsers", icon: <TeamOutlined /> },
    { label: "Students", value: "students", icon: <UserOutlined /> },
    { label: "Tutors", value: "tutors", icon: <UserOutlined /> },
    { label: "Admin", value: "admin", icon: <ToolOutlined /> },
    { label: "Requests", value: "requests", icon: <ImportOutlined /> },
  ];

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    {
      title: "Password",
      dataIndex: "password",
      key: "password",
      render: (password) => (
        <div style={{ wordBreak: "break-word" }}>{password}</div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (_, { role }) => {
        const color =
          role === "admin" ? "volcano" : role === "student" ? "green" : "blue";
        return <Tag color={color}>{role.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, { status }) => {
        const color =
          status === "active"
            ? "#87d068"
            : status === "locked"
            ? "#f50"
            : "#108ee9";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => {
        const { isLocked } = record;

        const unlockButton = (
          <Button
            color="lime"
            variant="filled"
            onClick={() => handleUnlock(record.email)}
          >
            <Space size="small">
              <UnlockTwoTone twoToneColor="#52c41a" />
              <Text type="success">Unlock</Text>
            </Space>
          </Button>
        );

        const lockButton = (
          <Button
            color="gold"
            variant="filled"
            onClick={() => handleLock(record.email)}
          >
            <Space size="small">
              <LockTwoTone twoToneColor="#faad14" />
              <Text type="warning">Lock</Text>
            </Space>
          </Button>
        );

        const deleteButton = (
          <Button
            color="red"
            variant="filled"
            onClick={() => handleDeleteUser(record.email)}
          >
            <Space size="small">
              <DeleteTwoTone twoToneColor="#ff4d4f" />
              <Text type="danger">Delete</Text>
            </Space>
          </Button>
        );

        return (
          <Flex gap="middle" justify="end">
            {isLocked ? unlockButton : lockButton}
            {deleteButton}
          </Flex>
        );
      },
    },
  ];

  return (
    <Content style={stylesInline.content}>
      <Flex vertical gap="middle">
        <Card>
          <Flex justify="space-between">
            <Segmented
              value={segmented}
              options={segmentedOptions}
              onChange={setSegmented}
            />
            <Space size="middle">
              <Input
                placeholder="Search User"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                style={{ width: "30rem" }}
              />
              {/* <Button type="primary" onClick={showModal}>
                <UserAddOutlined /> Add New User
              </Button> */}
              <Button type="primary" onClick={handleOpenAssignModal}>
                <UserSwitchOutlined /> Assign Tutor
              </Button>
            </Space>
          </Flex>
        </Card>
        <Card>
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{ pageSize: 5 }}
            rowKey="email"
          />
        </Card>
      </Flex>
      <AddUserModal isModalOpen={isModalOpen} hideModal={hideModal} />
      <Modal
        title="Assign Tutor to Students"
        open={isAssignModalOpen}
        onCancel={() => setIsAssignModalOpen(false)}
        onOk={handleAssign}
        okText="Assign"
      >
        <Flex gap="middle">
          <Card title="Select Students" style={{ width: "45%" }}>
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Select students"
              value={selectedStudents}
              onChange={setSelectedStudents}
            >
              {students.map((student) => (
                <Option key={student.email} value={student.email}>
                  {student.name}
                </Option>
              ))}
            </Select>
          </Card>

          <Card title="Select Tutor" style={{ width: "45%" }}>
            <Select
              style={{ width: "100%" }}
              placeholder="Select a tutor"
              value={selectedTutor}
              onChange={setSelectedTutor}
            >
              {tutors.map((tutor) => (
                <Option key={tutor.email} value={tutor.email}>
                  {tutor.name}
                </Option>
              ))}
            </Select>
          </Card>
        </Flex>
      </Modal>
    </Content>
  );
}

const stylesInline = { content: { padding: "2rem" } };

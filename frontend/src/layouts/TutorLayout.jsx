import {
  Avatar,
  Dropdown,
  Layout,
  Menu,
  Space,
  Typography,
  message,
  Modal,
  List,
  Card,
  Select,
  Input,
  Flex,
} from "antd";
import Logo from "../components/Logo/Logo.jsx";
import MenuList from "../components/tutor/MenuList.jsx";
import { Outlet, useLocation, useNavigate } from "react-router";
import {
  LogoutOutlined,
  UserOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { logoutUser } from "../../api_service/auth_service.js";
import { viewListStudentByTutor } from "../../api_service/admin_service.js";
import { getAllUser } from "../../api_service/mesages_service.js";

const { Header, Sider } = Layout;
const { Title } = Typography;
const { Option } = Select;

export default function TutorLayout() {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 992);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedListItem, setSelectedListItem] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [sortOption, setSortOption] = useState("name");

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 992);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setLoggedInUser(user);
      } catch (error) {
        console.error("Error parsing loggedInUser from localStorage:", error);
        setLoggedInUser(null);
        localStorage.removeItem("loggedInUser"); // Remove invalid data
      }
    }
  }, []);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      console.error("userId not found in localStorage");
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUserId = localStorage.getItem("userId");
      if (storedUserId) {
        try {
          const users = await getAllUser();
          const currentUser = users?.tutors?.find(
            (user) => user._id === storedUserId
          );
          setUser(currentUser);
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }
    };
    fetchUser();
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const titles = {
    "/tutor/dashboard": " Dashboard",
    "/tutor/calendar": " Calendar",
    "/tutor/messages": " Messages",
    "/tutor/documents": " Documents",
    "/tutor/blog": " Blog",
    // "/tutor/meeting": " Meeting",
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      message.success("Logout successful");

      localStorage.removeItem("token");
      localStorage.removeItem("loggedInUser");
      sessionStorage.removeItem("token");

      const logoutChannel = new BroadcastChannel("logout_channel");
      logoutChannel.postMessage("logout");

      navigate("/auth/login");
    } catch (error) {
      message.error("Logout failed!", error);
    }
  };

  useEffect(() => {
    const logoutChannel = new BroadcastChannel("logout_channel");
    logoutChannel.onmessage = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("loggedInUser");
      sessionStorage.removeItem("token");
      navigate("/auth/login");
    };

    return () => {
      logoutChannel.close();
    };
  }, [navigate]); // Added navigate as a dependency

  const handleInformationOfStudent = async () => {
    setIsModalVisible(true);
    try {
      if (userId) {
        const students = await viewListStudentByTutor(userId);
        setStudentList(students);
      } else {
        setStudentList([]);
        message.error("User ID not found");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      message.error("Failed to fetch student list");
      setStudentList([]);
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setSelectedListItem(student._id);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedStudent(null);
    setSelectedListItem(null);
  };

  const userMenu = (
    <Menu
      items={[
        {
          key: "profile",
          label: "Profile",
          icon: <UserOutlined />,
          onClick: () => navigate("/tutor/profile"),
        },
        {
          key: "liststudent",
          label: "Information of Student",
          icon: <InfoCircleOutlined />,
          onClick: handleInformationOfStudent,
        },
        {
          key: "logout",
          label: "Log out",
          icon: <LogoutOutlined />,
          onClick: handleLogout,
        },
      ]}
    />
  );

  const filteredAndSortedStudents = studentList
    .map((student) => {
      const username =
        student.username || `${student.firstname} ${student.lastname}`;
      return { ...student, username };
    })
    .filter(
      (student) =>
        student.username &&
        student.username.toLowerCase().includes(filterText.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "name") {
        return a.username && b.username
          ? a.username.localeCompare(b.username)
          : 0;
      } else {
        return (
          (b.blogIds ? b.blogIds.length : 0) -
          (a.blogIds ? a.blogIds.length : 0)
        );
      }
    });

  return (
    <Layout hasSider>
      <Sider
        style={inlineStyles.siderStyle}
        trigger={null}
        collapsible
        collapsed={collapsed}
      >
        <Logo />
        <MenuList />
      </Sider>
      <Layout>
        <Header style={inlineStyles.headerStyle}>
          <Title level={3} style={{ margin: 0, color: "#fff" }}>
            {titles[location.pathname] || "Tutor Panel"}
          </Title>
          <Space
            size="large"
            style={{ marginLeft: "auto", alignItems: "center" }}
          >
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Flex gap="small" align="center" style={{ cursor: "pointer" }}>
                <p style={{ margin: 0 }}>{user?.email}</p>
                <Avatar
                  src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${
                    userId || 1
                  }`}
                  icon={<UserOutlined />}
                />
              </Flex>
            </Dropdown>
          </Space>
        </Header>
        <Outlet />
        <Modal
          title="Student Information"
          visible={isModalVisible}
          onCancel={handleModalCancel}
          footer={null}
          width={800}
        >
          <Input
            placeholder="Filter by name"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <Select
            defaultValue="name"
            style={{ width: 200, marginBottom: 16 }}
            onChange={(value) => setSortOption(value)}
          >
            <Option value="name">Sort by Name</Option>
            <Option value="blogCount">Sort by Blog Count</Option>
          </Select>
          <List
            itemLayout="horizontal"
            dataSource={filteredAndSortedStudents}
            renderItem={(student) => (
              <List.Item
                onClick={() => handleStudentClick(student)}
                style={{
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                  backgroundColor:
                    selectedListItem === student._id
                      ? "#e6f7ff"
                      : "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f0f0f0")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    selectedListItem === student._id
                      ? "#e6f7ff"
                      : "transparent")
                }
              >
                <List.Item.Meta
                  title={student.username}
                  description={student.email}
                />
              </List.Item>
            )}
          />
          {selectedStudent && (
            <Card title={selectedStudent.username}>
              <p>
                Name: {selectedStudent.firstname} {selectedStudent.lastname}
              </p>
              <p>Email: {selectedStudent.email}</p>
              <p>Phone: {selectedStudent.phonenumber}</p>
              <p>
                Blog Count:{" "}
                {selectedStudent.blogIds ? selectedStudent.blogIds.length : 0}
              </p>
            </Card>
          )}
        </Modal>
      </Layout>
    </Layout>
  );
}

const inlineStyles = {
  siderStyle: {
    overflow: "auto",
    height: "100vh",
    position: "sticky",
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: "thin",
    scrollbarGutter: "stable",
  },
  headerStyle: {
    display: "flex",
    alignItems: "center",
    padding: "0 1.6rem",
    height: "7rem",
    background: "#1890ff",
    color: "#fff",
  },
};

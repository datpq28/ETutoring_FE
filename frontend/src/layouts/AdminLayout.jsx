import { Avatar, Dropdown, Layout, Menu, Space, Typography } from "antd";
import Logo from "../components/Logo/Logo.jsx";
import MenuList from "../components/admin/AccountsManagementPage/MenuList.jsx";
import { Outlet, useLocation, useNavigate } from "react-router";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
const { Header, Sider } = Layout;
const { Title } = Typography;
export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 992); // Mặc định true nếu màn hình nhỏ

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 992);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const navigate = useNavigate();
  const location = useLocation();
  const titles = {
    "/admin/dashboard": "🏠 Dashboard",
    "/admin/calendar": "📅 Calendar",
    "/admin/accounts-management": "Accounts Management",
    "/admin/blog-management": "📁 Blog Management",
    "/admin/document-management": "📁 Document Management",
    "/admin/meeting-management": "Meeting Management",
  };
  const userMenu = (
    <Menu
      items={[
        {
          key: "logout",
          label: "Log out",
          icon: <LogoutOutlined />,
          onClick: () => navigate("/auth/login"),
        },
      ]}
    />
  );
  return (
    <Layout hasSider>
      <Sider
        style={inlineStyles.siderStyle}
        width={240}
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
            {titles[location.pathname] || "Admin Panel"}
          </Title>
          <Space
            size="large"
            style={{ marginLeft: "auto", alignItems: "center" }}
          >
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Avatar icon={<UserOutlined />} />
            </Dropdown>
          </Space>
        </Header>
        <Outlet />
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
    background: "#1890ff", // Màu xanh đẹp của Ant Design
    color: "#fff",
  },
};

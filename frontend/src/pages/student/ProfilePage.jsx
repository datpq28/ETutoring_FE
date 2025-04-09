import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Layout,
  Typography,
  message,
  Row,
  Col,
} from "antd";
import { useState, useEffect } from "react";

import { updatePasswordLoggedIn, getInformationById } from "../../../api_service/auth_service";

const { Content } = Layout;
const userId = localStorage.getItem("userId");
const loggedInUserEmail = localStorage.getItem("loggedInUser");

export default function ProfilePage() {
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formPassword] = Form.useForm();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoadingProfile(true);
      try {
        const res = await getInformationById(userId);
        if (res) {
          setUserData(res);
        } else {
          message.error("Failed to fetch user data.");
        }
      } catch (err) {
        message.error("Something went wrong while fetching user data.");
        console.error("Error fetching user data:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const onChangePassword = async (values) => {
    setLoadingPassword(true);
    try {
      const res = await updatePasswordLoggedIn(
        loggedInUserEmail,
        values.old_password,
        values.new_password
      );
      if (res && res.message) {
        message.success("Password updated successfully!");
        formPassword.resetFields();
      } else if (res && res.error) {
        message.error(res.error);
      } else {
        message.error("Failed to update password");
      }
    } catch (err) {
      message.error("Old password is incorrect");
      console.error("Error updating password:", err);
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <Content style={stylesInline.content}>
      <Card style={{ width: "80rem", borderRadius: 8, boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
        <Typography.Title level={4}>Account Management</Typography.Title>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
          <Avatar
            size={150}
            src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${userId}`}
            style={{ border: "1px solid #ccc", borderRadius: "8px" }}
            shape="square"
          />
        </div>

        <Row gutter={24}>
          <Col span={12}>
            <Typography.Title level={5}>Change Password</Typography.Title>
            <Form layout="vertical" form={formPassword} onFinish={onChangePassword}>
              <Form.Item
                label="Old Password"
                name="old_password"
                rules={[{ required: true, message: "Please enter old password" }]}
              >
                <Input.Password placeholder="Old Password" />
              </Form.Item>
              <Form.Item
  label="New Password"
  name="new_password"
  rules={[
    { required: true, message: "Please enter new password" },
    {
      validator: (_, value) => {
        if (!value) {
          return Promise.resolve();
        }
        if (value.length < 8) {
          return Promise.reject(new Error("Password must be at least 8 characters"));
        }
        if (!/\d/.test(value)) {
          return Promise.reject(new Error("Password must contain at least one number"));
        }
        if (formPassword.getFieldValue("old_password") === value) {
          return Promise.reject(
            new Error("New password cannot be the same as the old password!")
          );
        }
        return Promise.resolve();
      },
    },
  ]}
>
  <Input.Password placeholder="New Password" />
</Form.Item>
              <Form.Item
                label="Confirm New Password"
                name="confirm_new_password"
                dependencies={["new_password"]}
                rules={[
                  { required: true, message: "Please confirm your new password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("new_password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("The two passwords that you entered do not match!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm New Password" />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: "100%" }}
                loading={loadingPassword}
              >
                Change Password
              </Button>
            </Form>
          </Col>
          <Col span={12}>
            <Typography.Title level={5}>Personal Information</Typography.Title>
            {userData && (
              <div>
                <p>
                  <strong>First Name:</strong> {userData.firstname}
                </p>
                <p>
                  <strong>Last Name:</strong> {userData.lastname}
                </p>
                <p>
                  <strong>Email:</strong> {userData.email}
                </p>
                <p>
                  <strong>Role:</strong> {userData.role}
                </p>
              </div>
            )}
          </Col>
        </Row>
      </Card>
    </Content>
  );
}

const stylesInline = {
  content: {
    padding: "2rem",
    display: "flex",
    justifyContent: "center",
  },
};

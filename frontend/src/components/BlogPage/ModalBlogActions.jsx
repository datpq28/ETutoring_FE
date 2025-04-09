import { CloseOutlined, DiffOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Space, notification } from "antd";
import { createBlog, editBlog } from "../../../api_service/blog_service.js";
const userId = localStorage.getItem("userId");
const userRole = localStorage.getItem("role") || "Student";
export default function ModalBlogActions({
  isModalOpen,
  onOK,
  onCancel,
  blogProp = null,
}) {
  const initialValues = blogProp
    ? {
        title: blogProp.title,
        content: blogProp.content,
        uploaderId: blogProp.userId,
        uploaderType: blogProp.userRole,
        tags: blogProp.tags.join(", "),
        imageUrl: blogProp.imageUrl,
      }
    : {};
  const [form] = Form.useForm();
  console.log("blogProp", blogProp);
  const handleSubmitForm = async () => {
    try {
      const values = await form.validateFields();
      const blog = {
        title: values.title,
        content: values.content,
        uploaderId: userId, // Lấy từ localStorage
        uploaderType: userRole, // Lấy từ localStorage
        tags: values.tags
          ? values.tags.split(",").map((tag) => tag.trim())
          : [],
        imageUrl: values.imageUrl,
      };
      if (blogProp) {
        // nếu nó có prop này tức là chỉnh sửa thì sẽ updateBlog
        const updatedBlog = {
          title: blog?.title,
          content: blog?.content,
          tags: blog?.tags,
          imageUrl: blog?.imageUrl,
        };
        await editBlog(blogProp?._id, updatedBlog);
      } else {
        await createBlog(blog);
      }
      notification.success({
        message: `${blogProp ? "Update" : "Post"} ${
          blog.title
        } Blog successful`,
        duration: 3, // Thời gian tự động đóng (giây)
      });
      onOK();
      form.resetFields();
    } catch (error) {
      console.log("Validation Failed:", error);
    }
  };
  const handleCloseModal = () => {
    form.resetFields();
    onCancel();
  };
  console.log("blogProp", blogProp);
  return (
    <Modal
      title={
        <Space size="small">
          <DiffOutlined />
          {blogProp ? "Update Blog" : "Post New Blog"}
        </Space>
      }
      onCancel={onCancel}
      open={isModalOpen}
      footer={[
        <Button key="cancel" onClick={handleCloseModal}>
          <Space size="small">
            <CloseOutlined />
            Cancel
          </Space>
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmitForm}>
          <Space size="small">
            <DiffOutlined />
            {blogProp ? "Update Blog" : "Post New Blog"}
          </Space>
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          label="Title Post"
          name="title"
          rules={[{ required: true, message: "Please input your Title Post!" }]}
        >
          <Input placeholder="Title Post" />
        </Form.Item>

        <Form.Item
          label="Content"
          name="content"
          rules={[{ required: true, message: "Please input the content!" }]}
        >
          <Input.TextArea rows={4} placeholder="Content" />
        </Form.Item>

        <Form.Item
          label="Tags (separated by commas)"
          name="tags"
          rules={[
            { required: true, message: "Please input at least one tag!" },
          ]}
        >
          <Input placeholder="Tags (separated by commas)" />
        </Form.Item>

        <Form.Item
          label="Image"
          name="imageUrl"
          rules={[
            {
              required: true,
              message: "Please input the image URL!",
            },
          ]}
        >
          <Input placeholder="URL image" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

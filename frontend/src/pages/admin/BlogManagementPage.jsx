import { Card, Layout, message, Table, Button, Popconfirm, Tag } from "antd";
import { deleteBlog, getBlogs } from "../../../api_service/blog_service.js";
import { useEffect, useState } from "react";
import LoadingSection from "../../components/common/LoadingSection.jsx";
import dayjs from "dayjs";
const { Content } = Layout;

export default function BlogManagementPage() {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const data = await getBlogs();
      setBlogs(data);
    } catch (error) {
      message.error("Error loading Blogs");
      console.log(error, "In BlogPage");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // Giả lập xóa, bạn có thể gọi API xóa tại đây
    setBlogs((prev) => prev.filter((blog) => blog._id !== id));
    await deleteBlog(id);
    message.success("Deleted successfully");
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Uploader Name",
      dataIndex: "uploaderName",
      key: "uploaderName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Uploader Type",
      dataIndex: "uploaderType",
      key: "uploaderType",
      render: (type) => (
        <Tag color={type === "Tutor" ? "geekblue" : "green"}>{type}</Tag>
      ),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      render: (tags) =>
        tags?.map((tag) => (
          <Tag key={tag} color="purple">
            {tag}
          </Tag>
        )),
    },
    {
      title: "Likes",
      dataIndex: "likes",
      key: "likes",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => dayjs(text).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Popconfirm
          title="Are you sure to delete this blog?"
          onConfirm={() => handleDelete(record.key)}
          okText="Yes"
          cancelText="No"
        >
          <Button danger type="link">
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const dataSource = blogs.map((blog) => ({
    key: blog._id,
    title: blog.title,
    uploaderName: `${blog.uploaderId?.firstname || ""} ${
      blog.uploaderId?.lastname || ""
    }`,
    email: blog.uploaderId?.email || "N/A",
    uploaderType: blog.uploaderType,
    tags: blog.tags,
    likes: blog.likes,
    createdAt: blog.createdAt,
  }));

  return (
    <Content style={stylesInline.content}>
      {isLoading ? (
        <LoadingSection />
      ) : (
        <Card title="Blog Management">
          <Table
            dataSource={dataSource}
            columns={columns}
            pagination={{ pageSize: 5 }}
          />
        </Card>
      )}
    </Content>
  );
}

const stylesInline = {
  content: {
    padding: "2rem",
  },
};

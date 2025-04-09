import React, { useEffect, useState } from "react";
import {
  EllipsisOutlined,
  ExclamationCircleFilled,
  LikeOutlined,
  MessageOutlined,
  TagOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Space,
  message,
  Modal,
  List,
  Image,
  Tooltip,
  Card,
  Flex,
  Button,
  Popover,
} from "antd";

import {
  deleteBlog,
  likeBlog,
  unlikeBlog,
} from "../../../api_service/blog_service.js";

import { formatCustomDate } from "../../utils/Date.js";
import ModalBlogActions from "./ModalBlogActions.jsx";
import CommentBox from "./CommentBox.jsx";
const DEFAULT_IMAGE_URL =
  "https://images.unsplash.com/photo-1550895030-823330fc2551?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const userId = localStorage.getItem("userId");
const userRole = localStorage.getItem("userRole");


export default function CardBlog({ blog, fetchBlogs }) {
  const [likes, setLikes] = useState(blog.likes);
  const [hasLiked, setHasLiked] = useState(false);
  const [processing, setIsProcessing] = useState(false);
  const [isModalCommentVisible, setIsModalCommentVisible] = useState(false);
  const [isModalEditBlogVisible, setIsModalEditBlogVisible] = useState(false);

  useEffect(() => {
    if (blog.likedBy.some((item) => item === userId)) {
      setHasLiked(true);
    }
  }, [blog]);

  const handleOpenModalEditBlog = () => {
    setIsModalEditBlogVisible(true);
  };

  const handleCloseModalEditBlog = () => {
    setIsModalEditBlogVisible(false);
  };

  const handleUpdatedBlog = () => {
    setIsModalEditBlogVisible(false);
    fetchBlogs();
  };

  const toggleOpenModalComment = () => {
    setIsModalCommentVisible((prev) => !prev);
  };

  // Xóa bài viết
  const handleDelete = async () => {
    Modal.confirm({
      title: `Are you sure delete blog ${blog.title}?`,
      icon: <ExclamationCircleFilled />,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteBlog(blog._id);
          message.success(`Deleted ${blog.title} successfully`);
          fetchBlogs(); // Reload danh sách blog
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa bài viết!");
          console.log(error, "In Card Blog");
        }
      },
    });
  };

  // Xử lý like/unlike bài viết
  const handleLike = async () => {
    if (processing) return;
    setLikes((prevLike) => (hasLiked ? prevLike - 1 : prevLike + 1));
    setHasLiked((prev) => !prev);
    setIsProcessing(true);
    try {
      if (!hasLiked) {
        //Chỗ gọi API
        await likeBlog(blog._id);
        message.success(`You liked the ${blog.title}`);
      } else {
        //Chỗ gọi API
        await unlikeBlog(blog._id);
        message.success(`You unlike the ${blog.title}`);
      }
    } catch (error) {
      message.error("Error like!");
      console.log(error, "In Card Blog");
    } finally {
      setIsProcessing(false);
    }
  };

  console.log(blog);

  const IconText = ({ icon, text, onClick, toolTipText, color = "8c8c8c" }) => (
    <Tooltip placement="top" title={toolTipText}>
      <span
        onClick={onClick}
        style={{ cursor: "pointer", userSelect: "none", color: color }}
      >
        <Space>
          {React.createElement(icon)}
          {text}
        </Space>
      </span>
    </Tooltip>
  );

  const listItemAction = [
    <IconText
      icon={LikeOutlined}
      text={likes}
      key="list-vertical-like-o"
      onClick={handleLike}
      toolTipText="Like"
      color={hasLiked ? "#1677ff" : "8c8c8c"}
    />,
    <IconText
      icon={MessageOutlined}
      text={blog.commentIds.length}
      key="list-vertical-message"
      toolTipText="Comment"
      color={isModalCommentVisible ? "#1677ff" : "8c8c8c"}
      onClick={toggleOpenModalComment}
    />,
    ...blog.tags.map((item, i) => (
      <IconText
        key={`${item}${i}`}
        icon={TagOutlined}
        text={item}
        toolTipText="Tags"
      />
    )),
  ];

  return (
    <Flex gap="middle" vertical style={{ marginBottom: "1.6rem" }}>
      {isModalEditBlogVisible && (
        <ModalBlogActions
          isModalOpen={isModalEditBlogVisible}
          blogProp={blog}
          onOK={handleUpdatedBlog}
          onCancel={handleCloseModalEditBlog}
        />
      )}
      <Card
        extra={
          blog.uploaderId._id === userId && (
            <Popover
              trigger="hover"
              content={
                <Flex gap="small" vertical>
                  <Button type="text" onClick={handleOpenModalEditBlog}>
                    Edit
                  </Button>

                  <Button type="text" onClick={handleDelete}>
                    Delete
                  </Button>
                </Flex>
              }
            >
              <Button type="text">
                <EllipsisOutlined />
              </Button>
            </Popover>
          )
        }
      >
        <List.Item
          actions={listItemAction}
          extra={
            <Image
              width={272}
              height={150}
              alt="logo"
              src={blog.imageUrl}
              preview={false}
              style={{ objectFit: "cover" }}
              onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE_URL)}
            />
          }
        >
          <List.Item.Meta
            avatar={
              <Avatar
                src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${blog.uploaderId._id}`}
              />
            }
            title={blog.title}
            description={`Post Date: ${formatCustomDate(blog.createdAt)} by ${
              blog.uploaderId.firstname
            } ${blog.uploaderId.lastname}`}
          />
          {blog.content}
        </List.Item>
      </Card>
      {isModalCommentVisible && (
        <CommentBox
          onOpenModalComment={toggleOpenModalComment}
          blogId={blog._id}
        />
      )}
    </Flex>
  );
}

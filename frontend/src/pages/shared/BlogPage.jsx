import { Card, Flex, Layout, List, message } from "antd";
import BlogActionBar from "../../components/BlogPage/BlogActionBar.jsx";
import { getBlogs } from "../../../api_service/blog_service.js";
import { useEffect, useState } from "react";
import LoadingSection from "../../components/common/LoadingSection.jsx";
import EmptySection from "../../components/common/EmptySection.jsx";
import CardBlog from "../../components/BlogPage/CardBlog.jsx";
import ModalBlogActions from "../../components/BlogPage/ModalBlogActions.jsx";
const userId = localStorage.getItem("userId");
const { Content } = Layout;
export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalBlogActionsVisible, setIsModalBlogActionsVisible] =
    useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [optionSearch, setOptionSearch] = useState("all");
  const [userSegmented, setUserSegmented] = useState("all_blogs");
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
  const handleOkForm = () => {
    setIsModalBlogActionsVisible(false);
    fetchBlogs();
  };

  const handleCancelForm = () => {
    setIsModalBlogActionsVisible(false);
  };

  const handleOpenModalActions = () => {
    setIsModalBlogActionsVisible(true);
  };

  const handleChangeOptionSearch = (value) => {
    setOptionSearch(value);
  };

  const handleChangeUserSegmented = (value) => {
    setUserSegmented(value);
  };

  const handleChangeSearchValue = (value) => {
    setSearchValue(value);
  };
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      !searchValue ||
      (optionSearch === "title" &&
        blog.title.toLowerCase().includes(searchValue.toLowerCase())) ||
      (optionSearch === "tags" &&
        blog.tags.some((tag) =>
          tag.toLowerCase().includes(searchValue.toLowerCase())
        )) ||
      optionSearch === "all";

    const matchesUser =
      userSegmented === "all_blogs" ||
      (userSegmented === "my_blogs" && blog.uploaderId._id === userId);

    return matchesSearch && matchesUser;
  });

  return (
    <>
      {isModalBlogActionsVisible && (
        <ModalBlogActions
          isModalOpen={isModalBlogActionsVisible}
          onOK={handleOkForm}
          onCancel={handleCancelForm}
          blogProp={null}
        />
      )}
      <Content style={stylesInline.content}>
        <Flex vertical gap="middle">
          <BlogActionBar
            onChangeSearchValue={handleChangeSearchValue}
            onChangeOptionSearch={handleChangeOptionSearch}
            onChangeUserSegmented={handleChangeUserSegmented}
            onOpenModalActions={handleOpenModalActions}
          />
          {isLoading ? (
            <LoadingSection length={3} />
          ) : filteredBlogs.length === 0 ? (
            <EmptySection />
          ) : (
            <>
              <Card>
                <List
                  itemLayout="vertical"
                  size="large"
                  dataSource={filteredBlogs}
                  renderItem={(blog, index) => (
                    <CardBlog key={index} blog={blog} fetchBlogs={fetchBlogs} />
                  )}
                />
              </Card>
            </>
          )}
        </Flex>
      </Content>
    </>
  );
}

const stylesInline = {
  content: {
    padding: "2rem",
  },
};

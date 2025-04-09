import { Typography } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { Link as LinkRouter } from "react-router";

const { Text, Link } = Typography;
export default function AuthBackButton({ children, path, style = {} }) {
  return (
    <LinkRouter style={{ ...styles.link, ...style }} to={path} component={Link}>
      <LeftOutlined style={styles.icon} />
      <Text style={styles.text}>{children}</Text>
    </LinkRouter>
  );
}

const styles = {
  link: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
  },
  icon: {
    width: "1.5rem",
    height: "1.5rem",
    color: "#313131",
    padding: "3px",
  },
  text: {
    color: "#313131",
    fontFamily: "Poppins",
    fontSize: "1.5rem",
    fontWeight: 400,
    lineHeight: "normal",
  },
};

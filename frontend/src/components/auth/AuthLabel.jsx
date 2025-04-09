import { Typography } from "antd";

const { Title } = Typography;
export default function AuthLabel({ children, style = {} }) {
  return (
    <Title
      level={1}
      style={{
        ...authLabelStyle,
        ...style,
      }}
    >
      {children}
    </Title>
  );
}

const authLabelStyle = {
  fontFamily: "Poppins, sans-serif",
  color: "#313131",
  fontSize: "2.4rem",
  fontWeight: 600,
  lineHeight: "normal",
  marginBottom: "0.62rem",
};

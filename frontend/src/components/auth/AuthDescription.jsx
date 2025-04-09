import { Typography } from "antd";
const { Text } = Typography;
export default function AuthDescription({ children, style = {} }) {
  return <Text style={{ ...authDescriptionStyle, ...style }}>{children}</Text>;
}

const authDescriptionStyle = {
  fontFamily: "Poppins, sans-serif",
  color: "#313131",
  fontSize: "2rem",
  fontWeight: 400,
  lineHeight: "normal",
  opacity: 0.75,
};

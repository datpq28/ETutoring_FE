import { Typography } from "antd";
import { Link as LinkRouter } from "react-router";
const { Text, Link } = Typography;
export default function AssistanceLink({ text, link, path, style }) {
  return (
    <Text style={{ ...styles.text, ...style }}>
      {text}{" "}
      <LinkRouter to={path} style={styles.link} component={Link}>
        {link}
      </LinkRouter>
    </Text>
  );
}

const styles = {
  text: {
    color: "#000",
    fontFamily: "Poppins",
    fontSize: "1.6rem",
    fontWeight: 400,
    lineHeight: "normal",
    marginTop: "1rem",
  },
  link: {
    color: "#D51D1D",
    fontFamily: "Poppins",
    fontSize: "1.6rem",
    fontWeight: 400,
    lineHeight: "normal",
  },
};

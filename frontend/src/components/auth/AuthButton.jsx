import { Button } from "antd";
export default function AuthButton({ children, onClick, style = {} }) {
  return (
    <Button
      type="primary"
      onClick={onClick}
      style={{ ...buttonStyle, ...style }}
    >
      {children}
    </Button>
  );
}

const buttonStyle = {
  width: "100%",
  height: "5.1rem",
  borderRadius: "1rem",
  background: "#527FE2",
  color: "#FFF",
  fontFamily: "Poppins",
  fontSize: "1.6rem",
  fontWeight: 700,
  lineHeight: "normal",
};

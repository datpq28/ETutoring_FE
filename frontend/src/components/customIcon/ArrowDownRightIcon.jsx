import Icon from "@ant-design/icons";

function ArrowDownRightSVG() {
  return (
    <svg width="24" height="24" fill="red">
      <path d="M17 15.586 6.707 5.293 5.293 6.707 15.586 17H7v2h12V7h-2v8.586z" />
    </svg>
  );
}

export default function ArrowDownRightIcon(props) {
  return <Icon component={ArrowDownRightSVG} {...props} />;
}

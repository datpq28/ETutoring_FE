import Icon from "@ant-design/icons";

function ArrowUpRightSVG() {
  return (
    <svg width="24" height="24" fill="green">
      <path d="M7 7h8.586L5.293 17.293l1.414 1.414L17 8.414V17h2V5H7v2z" />
    </svg>
  );
}

export default function ArrowUpRightIcon(props) {
  return <Icon component={ArrowUpRightSVG} {...props} />;
}

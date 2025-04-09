import { Card, Skeleton } from "antd";

export default function LoadingSection({ length = 1 }) {
  const arr = Array.from({ length: length }, (_, i) => i);
  return (
    <Card>
      {arr.map((_, index) => (
        <Skeleton key={index} active />
      ))}
    </Card>
  );
}

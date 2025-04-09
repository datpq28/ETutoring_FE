import { BookOutlined } from "@ant-design/icons";
import styles from "./Logo.module.css";

export default function Logo() {
  return (
    <div className={styles.logo}>
      <div className={styles["logo-icon"]}>
        <BookOutlined className={styles.bookIcon} />
        <p className={styles.logoText}>
          <span className={styles.highlight}>E</span> Learning
        </p>
      </div>
    </div>
  );
}

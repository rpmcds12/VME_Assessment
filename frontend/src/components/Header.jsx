import { Link } from 'react-router-dom';
import styles from './Header.module.css';

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <img
            src="/assets/uss-logo.png"
            alt="US Signal"
            className={styles.logo}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        <span className={styles.title}>VME Analyzer</span>

        <div className={styles.actions}>
          <Link to="/admin" className={styles.adminBtn}>
            Admin Matrix
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;

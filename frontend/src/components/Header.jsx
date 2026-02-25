import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

function Header() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

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
          {isAdmin ? (
            <Link to="/" className={styles.navBtn}>
              ← Back to Analyzer
            </Link>
          ) : (
            <Link to="/admin" className={styles.navBtn}>
              Admin Matrix
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

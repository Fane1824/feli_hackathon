import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../styles/Navbar.module.css';

function Navbar() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? styles.active : '';
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          Felicity Hackathon
        </Link>
        <ul className={styles.navLinks}>
          <li>
            <Link to="/" className={`${styles.navLink} ${isActive('/')}`}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/builder" className={`${styles.navLink} ${isActive('/builder')}`}>
              Builder
            </Link>
          </li>
          <li>
            <Link to="/communities" className={`${styles.navLink} ${isActive('/communities')}`}>
              Communities
            </Link>
          </li>
          <li>
            <Link to="/lesson" className={`${styles.navLink} ${isActive('/lesson')}`}>
              Lesson Converter
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;

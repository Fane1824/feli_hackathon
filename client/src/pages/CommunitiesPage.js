import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/Communities.module.css';

function CommunitiesPage() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/communities');
        setCommunities(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch communities');
        setLoading(false);
        console.error(err);
      }
    };

    fetchCommunities();
  }, []);

  if (loading) return <div className={styles.emptyState}>Loading communities...</div>;
  if (error) return <div className={styles.emptyState} style={{color: 'var(--danger-color)'}}>{error}</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Communities</h1>
        <Link 
          to="/create-community" 
          className={styles.createButton}
        >
          Create Community
        </Link>
      </div>
      
      {communities.length === 0 ? (
        <p className={styles.emptyState}>No communities found. Create one to get started!</p>
      ) : (
        <div className={styles.grid}>
          {communities.map(community => (
            <Link to={`/community/${community.id}`} key={community.id} className={styles.card}>
              <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>{community.name}</h2>
                <div className={styles.memberCount}>
                  <span>Members:</span> {community.memberCount}
                </div>
                <div className={styles.lookingFor}>
                  <span>Looking for:</span> {community.lookingFor}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default CommunitiesPage;

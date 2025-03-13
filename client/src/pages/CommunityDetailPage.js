import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/CommunityDetail.module.css';

function CommunityDetailPage() {
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/communities/${id}`);
        console.log('Raw response:', response);
        console.log('Community data structure:', JSON.stringify(response.data, null, 2));
        console.log('Members array:', response.data.Members);
        setCommunity(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch community details');
        setLoading(false);
        console.error('Error fetching community:', err);
      }
    };

    fetchCommunity();
  }, [id]);

  if (loading) return <div className={styles.loading}>Loading community details...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!community) return <div className={styles.loading}>Community not found</div>;

  const members = community.Members || community.members || [];
  console.log('Members being rendered:', members);

  return (
    <div className={styles.container}>
      <Link to="/communities" className={styles.backLink}>
        ← Back to Communities
      </Link>
      
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{community.name}</h1>
          
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Looking For</h2>
            <p>{community.lookingFor}</p>
          </div>
          
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Contact</h2>
            <a href={`mailto:${community.contactEmail}`} className={styles.email}>
              {community.contactEmail}
            </a>
          </div>
          
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Members ({members.length})</h2>
            <div className={styles.membersGrid}>
              {members.map(member => (
                <div key={member.id} className={styles.memberCard}>
                  <h3 className={styles.memberName}>{member.name}</h3>
                  {member.biography && (
                    <p className={styles.memberBio}>{member.biography}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommunityDetailPage;

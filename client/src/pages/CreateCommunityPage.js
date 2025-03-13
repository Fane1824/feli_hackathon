import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/CreateCommunity.module.css';

function CreateCommunityPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    lookingFor: '',
    contactEmail: '',
    members: [{ name: '', biography: '' }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMemberChange = (index, e) => {
    const { name, value } = e.target;
    const updatedMembers = [...formData.members];
    updatedMembers[index] = { ...updatedMembers[index], [name]: value };

    setFormData(prev => ({
      ...prev,
      members: updatedMembers
    }));
  };

  const addMember = () => {
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, { name: '', biography: '' }]
    }));
  };

  const removeMember = (index) => {
    if (formData.members.length > 1) {
      const updatedMembers = formData.members.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        members: updatedMembers
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Filter out empty member entries
      const validMembers = formData.members.filter(member => member.name.trim() !== '');
      
      const dataToSubmit = {
        ...formData,
        members: validMembers
      };

      await axios.post('http://localhost:5001/api/communities', dataToSubmit);
      setLoading(false);
      navigate('/communities'); // Redirect to communities page after successful creation
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create community');
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h1 className={styles.title}>Create a New Community</h1>
      
      {error && (
        <div className={styles.error}>{error}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Community Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Looking For *</label>
          <textarea
            name="lookingFor"
            value={formData.lookingFor}
            onChange={handleChange}
            className={styles.input}
            placeholder="What roles or expertise are you looking for? (e.g., History Experts, Software Engineers)"
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Contact Email *</label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>
        
        <h2 className={styles.subTitle}>Members</h2>
        
        {formData.members.map((member, index) => (
          <div key={index} className={styles.memberContainer}>
            <div className={styles.memberHeader}>
              <h3 className={styles.memberTitle}>Member {index + 1}</h3>
              {formData.members.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeMember(index)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              )}
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Name</label>
              <input
                type="text"
                name="name"
                value={member.name}
                onChange={(e) => handleMemberChange(index, e)}
                className={styles.input}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Biography</label>
              <textarea
                name="biography"
                value={member.biography}
                onChange={(e) => handleMemberChange(index, e)}
                className={styles.input}
                rows="3"
              />
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addMember}
          className={styles.addButton}
        >
          Add Member
        </button>
        
        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => navigate('/communities')}
            className={`${styles.button} ${styles.secondaryButton}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${styles.button} ${styles.primaryButton}`}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Community'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateCommunityPage;

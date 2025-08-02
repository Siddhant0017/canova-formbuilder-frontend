
import React, { useState, useEffect } from 'react';

const SharedWorks = () => {
  const [sharedWorks, setSharedWorks] = useState({
    sharedByMe: [],
    sharedWithMe: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSharedWorks();
  }, []);

  const fetchSharedWorks = async () => {
    try {
      const response = await fetch('/api/dashboard/shared-works', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setSharedWorks({
          sharedByMe: result.sharedByMe,
          sharedWithMe: result.sharedWithMe
        });
      }
    } catch (error) {
      console.error('Error fetching shared works:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading shared works...</div>;

  return (
    <div className="shared-works">
      <h2>Shared Works</h2>
      
      <div className="shared-section">
        <h3>Forms I've Shared</h3>
        {sharedWorks.sharedByMe.map(form => (
          <div key={form._id} className="form-card">
            <h4>{form.title}</h4>
            <p>Shared with {form.accessControl.length} user(s)</p>
          </div>
        ))}
      </div>

      <div className="shared-section">
        <h3>Forms Shared with Me</h3>
        {sharedWorks.sharedWithMe.map(form => (
          <div key={form._id} className="form-card">
            <h4>{form.title}</h4>
            <p>Shared by {form.owner.name}</p>
            <p>Your access: {form.accessControl.find(ac => ac.userId === currentUserId)?.permission}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SharedWorks;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import TemplateCard from '../components/TemplateCard';
import api from '../services/api';
import './Templates.css';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'survey', label: 'Surveys' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'registration', label: 'Registration' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'contact', label: 'Contact' }
  ];


  const sampleTemplates = [
    {
      _id: 'template1',
      title: 'Customer Satisfaction Survey',
      description: 'Collect customer feedback and satisfaction ratings',
      category: 'survey',
      questions: [
        { id: '1', type: 'text', title: 'What is your name?', required: true },
        { id: '2', type: 'image', title: 'How would you rate our service?', options: [
          { id: 'o1', text: 'Excellent' },
          { id: 'o2', text: 'Good' },
          { id: 'o3', text: 'Fair' },
          { id: 'o4', text: 'Poor' }
        ]},
        { id: '3', type: 'prompt', title: 'Any additional feedback?', required: false }
      ],
      design: {
        backgroundColor: '#ffffff',
        sectionColor: '#f8f9fa',
        theme: 'light'
      }
    },
    {
      _id: 'template2',
      title: 'Event Registration',
      description: 'Register attendees for your event',
      category: 'registration',
      questions: [
        { id: '1', type: 'text', title: 'Full Name', required: true },
        { id: '2', type: 'text', title: 'Email Address', required: true },
        { id: '3', type: 'image', title: 'Select your ticket type', options: [
          { id: 'o1', text: 'Early Bird' },
          { id: 'o2', text: 'Regular' },
          { id: 'o3', text: 'VIP' }
        ]}
      ],
      design: {
        backgroundColor: '#667eea',
        sectionColor: '#ffffff',
        theme: 'light'
      }
    },
    {
      _id: 'template3',
      title: 'Product Feedback Form',
      description: 'Get detailed feedback about your product',
      category: 'feedback',
      questions: [
        { id: '1', type: 'text', title: 'Product Name', required: true },
        { id: '2', type: 'image', title: 'Overall Rating', options: [
          { id: 'o1', text: '⭐' },
          { id: 'o2', text: '⭐⭐' },
          { id: 'o3', text: '⭐⭐⭐' },
          { id: 'o4', text: '⭐⭐⭐⭐' },
          { id: 'o5', text: '⭐⭐⭐⭐⭐' }
        ]},
        { id: '3', type: 'prompt', title: 'What could we improve?', required: false }
      ],
      design: {
        backgroundColor: '#38a169',
        sectionColor: '#ffffff',
        theme: 'light'
      }
    }
  ];

  useEffect(() => {
    setTemplates(sampleTemplates);
    setLoading(false);
  }, []);

  const handleUseTemplate = async (template) => {
    try {
      const formData = {
        title: template.title,
        description: template.description,
        questions: template.questions,
        design: template.design,
        status: 'draft'
      };

      const response = await api.post('/forms', formData);
      toast.success('Template applied successfully!');
      navigate(`/form-builder/${response.data.form._id}`);
    } catch (error) {
      toast.error('Failed to use template');
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="templates">
        <Sidebar />
        <div className="templates-content">
          <Header />
          <div className="templates-loading">
            <div className="loading-spinner"></div>
            <p>Loading templates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="templates">
      <Sidebar />
      
      <div className="templates-content">
        <Header />
        
        <div className="templates-main">
          <div className="templates-header">
            <h1>Form Templates</h1>
            <p>Start with a professionally designed template</p>
          </div>

          <div className="templates-filters">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="category-filters">
              {categories.map(category => (
                <button
                  key={category.value}
                  className={`category-btn ${selectedCategory === category.value ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.value)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <div className="templates-grid">
            {filteredTemplates.map(template => (
              <TemplateCard
                key={template._id}
                template={template}
                onUse={() => handleUseTemplate(template)}
              />
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="no-templates">
              <h3>No templates found</h3>
              <p>Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Templates;


import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../services/analytics';

const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const pagePath = location.pathname + location.search;
    // Basic title generation - in a real app, use Helmet or similar
    const pageTitle = document.title; 
    trackPageView(pagePath, pageTitle);
  }, [location]);

  return null;
};

export default PageTracker;

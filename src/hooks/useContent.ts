import { useState, useEffect } from 'react';
import { getWebsiteContent, getContentByPage, processContentValue, ContentByPage } from '../services/contentApi';
import { getDesaSettings } from '../services/api';

// Custom hook for managing website content
export const useContent = (page?: string) => {
  const [content, setContent] = useState<ContentByPage>({});
  const [pageContent, setPageContent] = useState<ContentByPage[string]>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get village settings for replacements
        const settings = await getDesaSettings();
        const replacements = {
          '{village_name}': settings.nama_desa,
          '{village_slogan}': settings.slogan,
          '{year}': new Date().getFullYear().toString()
        };

        if (page) {
          // Fetch content for specific page
          const data = await getContentByPage(page);
          
          // Process content values with replacements
          const processedData: ContentByPage[string] = {};
          Object.entries(data).forEach(([section, sectionContent]) => {
            processedData[section] = {};
            Object.entries(sectionContent).forEach(([key, value]) => {
              processedData[section][key] = processContentValue(value, replacements);
            });
          });
          
          setPageContent(processedData);
        } else {
          // Fetch all content
          const data = await getWebsiteContent();
          
          // Process all content values with replacements
          const processedData: ContentByPage = {};
          Object.entries(data).forEach(([pageName, pageData]) => {
            processedData[pageName] = {};
            Object.entries(pageData).forEach(([section, sectionContent]) => {
              processedData[pageName][section] = {};
              Object.entries(sectionContent).forEach(([key, value]) => {
                processedData[pageName][section][key] = processContentValue(value, replacements);
              });
            });
          });
          
          setContent(processedData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [page]);

  // Helper function to get content value
  const getContent = (section: string, key: string, defaultValue: string = ''): string => {
    if (page) {
      return pageContent[section]?.[key] || defaultValue;
    }
    return content[page || '']?.[section]?.[key] || defaultValue;
  };

  // Helper function to get global content
  const getGlobalContent = (section: string, key: string, defaultValue: string = ''): string => {
    return content.global?.[section]?.[key] || defaultValue;
  };

  // Helper function to parse JSON content
  const getJsonContent = (section: string, key: string, defaultValue: any = []): any => {
    const value = getContent(section, key);
    if (!value) return defaultValue;
    
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue;
    }
  };

  return {
    content,
    pageContent,
    loading,
    error,
    getContent,
    getGlobalContent,
    getJsonContent
  };
};

// Hook for global content (navigation, footer, buttons, messages)
export const useGlobalContent = () => {
  const { content, loading, error, getGlobalContent } = useContent();

  return {
    content: content.global || {},
    loading,
    error,
    getContent: getGlobalContent,
    // Specific getters for common global content
    getNavigation: (key: string, defaultValue: string = '') => 
      getGlobalContent('navigation', key, defaultValue),
    getFooter: (key: string, defaultValue: string = '') => 
      getGlobalContent('footer', key, defaultValue),
    getButton: (key: string, defaultValue: string = '') => 
      getGlobalContent('buttons', key, defaultValue),
    getMessage: (key: string, defaultValue: string = '') => 
      getGlobalContent('messages', key, defaultValue)
  };
};
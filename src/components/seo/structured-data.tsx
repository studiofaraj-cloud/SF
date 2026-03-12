'use client';

import { useEffect } from 'react';

interface StructuredDataProps {
  data: object | object[];
  id?: string;
}

export function StructuredData({ data, id = 'structured-data' }: StructuredDataProps) {
  useEffect(() => {
    const jsonLd = Array.isArray(data) ? data : [data];
    
    // Remove existing structured data scripts with this id
    const existingScripts = document.querySelectorAll(`script[data-structured-data-id="${id}"]`);
    existingScripts.forEach(script => script.remove());
    
    // Add new structured data scripts
    jsonLd.forEach((item, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(item);
      script.setAttribute('data-structured-data-id', `${id}-${index}`);
      document.head.appendChild(script);
    });
    
    return () => {
      // Cleanup on unmount
      const scriptsToRemove = document.querySelectorAll(`script[data-structured-data-id^="${id}"]`);
      scriptsToRemove.forEach(script => script.remove());
    };
  }, [data, id]);

  return null;
}

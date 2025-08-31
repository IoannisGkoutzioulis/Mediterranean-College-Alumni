import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const Portal = ({ children }) => {
  const elRef = useRef(null);
  if (!elRef.current) {
    elRef.current = document.createElement('div');
  }

  useEffect(() => {
    document.body.appendChild(elRef.current);
    return () => {
      document.body.removeChild(elRef.current);
    };
  }, []);

  return createPortal(children, elRef.current);
};

export default Portal; 
import React from 'react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

const ResponsiveLayout = ({ children }: ResponsiveLayoutProps) => {
  return <>{children}</>;
};

export default ResponsiveLayout;

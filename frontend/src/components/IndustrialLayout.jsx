import React from 'react';
import PropTypes from 'prop-types';
import IndustrialSidebar from './IndustrialSidebar';
import IndustrialHeader from './IndustrialHeader';

const IndustrialLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex bg-slate-950 min-h-screen font-display">
      <IndustrialSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <IndustrialHeader
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

IndustrialLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default IndustrialLayout;

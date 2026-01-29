import React from 'react';
import PropTypes from 'prop-types';
import ResidentialSidebar from './ResidentialSidebar';
import ResidentialHeader from './ResidentialHeader';

const ResidentialLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="bg-slate-950 font-display text-slate-200 antialiased h-screen overflow-hidden flex">
      <ResidentialSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <ResidentialHeader
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

ResidentialLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ResidentialLayout;

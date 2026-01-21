import React from 'react';
import PropTypes from 'prop-types';
import ResidentialSidebar from './ResidentialSidebar';
import ResidentialHeader from './ResidentialHeader';

const ResidentialLayout = ({ children }) => {
  return (
    <div className="bg-background-light font-display text-slate-900 antialiased h-screen overflow-hidden flex">
      <ResidentialSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ResidentialHeader />
        <main className="flex-1 overflow-y-auto p-8 bg-background-light">
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

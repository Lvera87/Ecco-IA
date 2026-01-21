import React from 'react';
import PropTypes from 'prop-types';
import ResidentialSidebar from './ResidentialSidebar';
import ResidentialHeader from './ResidentialHeader';

const ResidentialLayout = ({ children }) => {
  return (
    <div className="bg-slate-950 font-display text-slate-200 antialiased h-screen overflow-hidden flex">
      <ResidentialSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ResidentialHeader />
        <main className="flex-1 overflow-y-auto">
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

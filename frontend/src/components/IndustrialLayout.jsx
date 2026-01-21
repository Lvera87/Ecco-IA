import React from 'react';
import PropTypes from 'prop-types';
import IndustrialSidebar from './IndustrialSidebar';
import IndustrialHeader from './IndustrialHeader';

const IndustrialLayout = ({ children }) => {
  return (
    <div className="flex bg-slate-950 min-h-screen">
      <IndustrialSidebar />
      <div className="flex-1 flex flex-col">
        <IndustrialHeader />
        <main className="flex-1 overflow-y-auto">
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

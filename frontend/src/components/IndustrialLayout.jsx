import React from 'react';
import PropTypes from 'prop-types';
import IndustrialSidebar from './IndustrialSidebar';
import IndustrialHeader from './IndustrialHeader';

const IndustrialLayout = ({ children }) => {
  return (
    <div className="flex bg-background-light">
      <IndustrialSidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <IndustrialHeader />
        <main className="p-8 max-w-[1600px] mx-auto w-full">
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

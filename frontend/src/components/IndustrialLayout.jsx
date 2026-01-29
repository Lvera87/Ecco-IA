import React from 'react';
import PropTypes from 'prop-types';
import IndustrialSidebar from './IndustrialSidebar';
import IndustrialHeader from './IndustrialHeader';
import EcoAssistant from './industrial/EcoAssistant';

const IndustrialLayout = ({ children }) => {
  return (
    <div className="flex bg-slate-950 min-h-screen">
      <IndustrialSidebar />
      <div className="flex-1 flex flex-col relative"> {/* Added relative for positioning context if needed */}
        <IndustrialHeader />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Assistant Widget Overlay */}
        <EcoAssistant />
      </div>
    </div>
  );
};

IndustrialLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default IndustrialLayout;

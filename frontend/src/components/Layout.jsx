import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import IndustrialLayout from './IndustrialLayout';
import ResidentialLayout from './ResidentialLayout';

const Layout = ({ children }) => {
  const location = useLocation();
  const { pathname } = location;

  const industrialRoutes = [
    '/industrial-dashboard',
    '/global-consumption',
    '/carbon-footprint-industrial',
    '/industrial-settings',
    '/industrial-config',
  ];

  const residentialRoutes = [
    '/dashboard',
    '/financial-impact',
    '/appliances',
    '/missions',
    '/energy-analysis',
    '/carbon-footprint',
  ];

  if (industrialRoutes.some(route => pathname.startsWith(route))) {
    return <IndustrialLayout>{children}</IndustrialLayout>;
  }

  if (residentialRoutes.some(route => pathname.startsWith(route))) {
    return <ResidentialLayout>{children}</ResidentialLayout>;
  }

  // Default layout for pages without a sidebar/header
  return <>{children}</>;
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;

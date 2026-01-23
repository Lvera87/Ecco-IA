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
  ];

  const residentialRoutes = [
    '/dashboard',
    '/financial-impact',
    '/appliances',
    '/missions',
    '/energy-analysis',
    '/carbon-footprint',
    '/residential-assistant',
    '/profile',
  ];

  const isMatch = (routes) => {
    return routes.some(route => pathname === route || pathname.startsWith(`${route}/`));
  };

  if (isMatch(industrialRoutes)) {
    return <IndustrialLayout>{children}</IndustrialLayout>;
  }

  if (isMatch(residentialRoutes)) {
    return <ResidentialLayout>{children}</ResidentialLayout>;
  }

  // Default layout for pages without a sidebar/header
  return <>{children}</>;
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;

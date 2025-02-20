import React from "react";
import PropTypes from "prop-types";

const AuthContext = React.createContext(null);

/**
 * AuthProvider component that supplies authentication context.
 * 
 * @param {Object} props - Component properties.
 * @param {any} props.userData - Initial user data.
 * @param {any} props.children - Child components to render.
 * @returns {JSX.Element} The AuthContext provider component.
 */
export const AuthProvider = ({ userData, children }) => {
  // Initialize user state with provided userData
  let [user, setUser] = React.useState(userData);

  // Parse user data if it's a string
  user = typeof user === "string" ? JSON.parse(user) : user;

  // Return the AuthContext provider with user and setUser in its value
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  userData: PropTypes.any,
  children: PropTypes.any,
};

export const useAuth = () => React.useContext(AuthContext);

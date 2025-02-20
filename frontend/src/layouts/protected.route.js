import React from "react";
import { Route } from "react-router-dom";
import { useAuth } from "../auth-context/auth.context";
import { useHistory } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";

/**
 * A protected route component that checks if the user is signed in
 * before allowing them to access the route.
 * @param {Object} props - The props of the component
 * @returns {Object} - The JSX of the component
 */
export const ProtectedRoute = ({ ...rest }) => {
  const history = useHistory();
  let { user } = useAuth();
  // if no user or no token, redirect to sign in
  if (!user || !user.token || user.token === "") {
    return (
      <SweetAlert
        style={{backgroundColor:'rgba(66, 153, 225, 0.6)'}}
        // confirmation button text
        confirmBtnText="Sign In"
        // confirmation button style
        confirmBtnStyle={{padding:'5px 15px 5px 15px'}}
        // title of the alert
        title="You must be signed in!"
        // on cancel, redirect to sign in
        onCancel={() => history.push("/auth/sign-in")}
        // on confirm, redirect to sign in
        onConfirm={() => history.push("/auth/sign-in")}
        // confirmation button class
        confirmBtnCssClass={"px-5"}
      />
    );
  }

  // if user is signed in, render the route
  return <Route {...rest} />;
};

import React, { useState } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import routes from "routes.js";

// Chakra imports
import { Box, useColorModeValue } from "@chakra-ui/react";

// Layout components
import { SidebarContext } from "contexts/SidebarContext";

// Layout component for the authentication pages

// Chakra imports
import { Box, useColorModeValue } from "@chakra-ui/react";

// Layout components
import { SidebarContext } from "contexts/SidebarContext";

/**
 * The Auth component renders the authentication pages. It uses the
 * SidebarContext to provide the toggleSidebar state and the
 * setToggleSidebar function to the components.
 */
export default function Auth() {
  // states and functions
  /**
   * The toggleSidebar state is used to change the width of the sidebar
   * based on the user's preferences.
   */
  const [toggleSidebar, setToggleSidebar] = useState(false);
  /**
   * The getRoute function is used to determine if the user is on a full
   * screen map page or not. If the user is on a full screen map page, the
   * sidebar is hidden.
   */
  const getRoute = () => {
    return window.location.pathname !== "/auth/full-screen-maps";
  };
  /**
   * The getRoutes function is used to create the routes for the
   * authentication pages. It maps over the routes array and returns a
   * Route component for each route.
   */
  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/auth") {
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        );
      }
      if (prop.collapse) {
        return getRoutes(prop.items);
      }
      if (prop.category) {
        return getRoutes(prop.items);
      } else {
        return null;
      }
    });
  };
  /**
   * The authBg variable is used to set the background color of the
   * authentication pages based on the user's color mode preference.
   */
  const authBg = useColorModeValue("white", "navy.900");
  /**
   * Set the direction of the page to left-to-right.
   */
  document.documentElement.dir = "ltr";
  /**
   * Return the JSX of the component.
   */
  return (
    <Box>
      <SidebarContext.Provider
        value={{
          toggleSidebar,
          setToggleSidebar,
        }}>
        <Box
          bg={authBg}
          float='right'
          minHeight='100vh'
          height='100%'
          position='relative'
          w='100%'
          transition='all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)'
          transitionDuration='.2s, .2s, .35s'
          transitionProperty='top, bottom, width'
          transitionTimingFunction='linear, linear, ease'>
          {getRoute() ? (
            <Box mx='auto' minH='100vh'>
              <Switch>
                {getRoutes(routes)}
                <Redirect
                  from='/auth'
                  to='/auth/sign-in/default
                  '
                />
              </Switch>
            </Box>
          ) : null}
        </Box>
      </SidebarContext.Provider>
    </Box>
  );
}

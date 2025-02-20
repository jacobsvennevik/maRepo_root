import React, { useEffect, Fragment } from 'react';
import { withRouter } from 'react-router-dom';

/**
 * Component that listens to route changes and scrolls to the top of the page on every change
 * @param {Object} props - Component props
 * @param {Object} props.history - React router's history object
 * @param {Object} props.children - Children components
 * @returns {Object} - The ScrollToTop component
 */
function ScrollToTop({ history, children }) {
  useEffect(() => {
    /**
     * Listen to route changes and scroll to the top of the page on every change
     * This is done to prevent the user from being left at a position far down the page
     * when they navigate to a new page
     */
    const unlisten = history.listen(() => {
      window.scrollTo(0, 0);
    });
    return () => {
      unlisten();
    }
  }, [history]);

  return <Fragment>{children}</Fragment>;
}

export default withRouter(ScrollToTop);
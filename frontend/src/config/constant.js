/**
 * Configuration constants for the application.
 * @namespace frontend.src.config.constant
 */
let BACKEND_SERVER = null;
if (process.env.REACT_APP_BACKEND_SERVER) {
  BACKEND_SERVER = process.env.REACT_APP_BACKEND_SERVER;
} else {
  BACKEND_SERVER = "http://localhost:5000/api/";
}

export const API_SERVER = BACKEND_SERVER;
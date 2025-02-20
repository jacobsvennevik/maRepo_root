/**
 * A class providing static methods for handling user authentication.
 */
class AuthApi {
  /**
   * Sends a POST request to the login endpoint to authenticate a user.
   * @param {object} data - The user's login credentials.
   * @returns {Promise} The response from the API.
   */
  static Login = (data) => {
    // Send a POST request to the login endpoint with the provided data.
    return axios.post(`${base}/login`, data);
  };

  /**
   * Sends a POST request to the register endpoint to create a new user account.
   * @param {object} data - The user's registration data.
   * @returns {Promise} The response from the API.
   */
  static Register = (data) => {
    // Send a POST request to the register endpoint with the provided data.
    return axios.post(`${base}/register`, data);
  };

  /**
   * Sends a POST request to the logout endpoint to log out the user.
   * @param {object} data - The user's logout data, including their authentication token.
   * @returns {Promise} The response from the API.
   */
  static Logout = (data) => {
    // Send a POST request to the logout endpoint with the provided data and an Authorization header containing the user's token.
    return axios.post(`${base}/logout`, data, { headers: { Authorization: `${data.token}` } });
  };
}
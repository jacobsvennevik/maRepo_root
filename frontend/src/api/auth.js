import axios from "axios";
  /**
   * Api for authentication
   * 
   * @param {Object} data - contains email and password
   * @returns {Promise} - returns a promise with the response data
   */
class AuthApi {
  static Login = (data) => {
    return axios.post(`${base}/login`, data);
  };

  /**
   * Api for registration
   * 
   * @param {Object} data - contains email and password
   * @returns {Promise} - returns a promise with the response data
   */
  static Register = (data) => {
    return axios.post(`${base}/register`, data);
  };

  /**
   * Api for logout
   * 
   * @param {Object} data - contains the token
   * @returns {Promise} - returns a promise with the response data
   */
  static Logout = (data) => {
    return axios.post(`${base}/logout`, data, { headers: { Authorization: `${data.token}` } });
  };
}

let base = "users";

export default AuthApi;

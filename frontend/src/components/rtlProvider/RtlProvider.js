/* eslint-disable */
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtl from "stylis-plugin-rtl";
// NB: A unique `key` is important for it to work!
const options = {
  rtl: { key: "css-ar", stylisPlugins: [rtl] },
  ltr: { key: "css-en" },
};
/**
 * RtlProvider component.
 * 
 * This component is used to provide the RTL (Right-to-Left) support for the application.
 * It uses the `stylis-plugin-rtl` to reverse the CSS styles for RTL languages.
 * 
 * @param {Node} children - The children components to render.
 * @returns {CacheProvider} The CacheProvider component with the RTL cache.
 */
export function RtlProvider({ children }) {
  /**
   * Get the direction of the document.
   * 
   * @type {string} - The direction of the document. It can be "ltr" or "rtl".
   */
  const dir = document.documentElement.dir == "ar" ? "rtl" : "ltr";

  /**
   * Create the cache for the RTL support.
   * 
   * @type {Cache} - The cache for the RTL support.
   */
  const cache = createCache(options[dir]);

  /**
   * Render the CacheProvider component with the RTL cache.
   * 
   * @returns {CacheProvider} The CacheProvider component with the RTL cache.
   */
  return <CacheProvider value={cache} children={children} />;
}

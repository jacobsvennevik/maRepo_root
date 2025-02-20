import { mode } from "@chakra-ui/theme-tools";
export const globalStyles = {
  colors: {
    brand: {
      100: "#E9E3FF",
      200: "#422AFB",
      300: "#422AFB",
      400: "#7551FF",
      500: "#422AFB",
      600: "#3311DB",
      700: "#02044A",
      800: "#190793",
      900: "#11047A",
    },
    brandScheme: {
      100: "#E9E3FF",
      200: "#7551FF",
      300: "#7551FF",
      400: "#7551FF",
      500: "#422AFB",
      600: "#3311DB",
      700: "#02044A",
      800: "#190793",
      900: "#02044A",
    },
    brandTabs: {
      100: "#E9E3FF",
      200: "#422AFB",
      300: "#422AFB",
      400: "#422AFB",
      500: "#422AFB",
      600: "#3311DB",
      700: "#02044A",
      800: "#190793",
      900: "#02044A",
    },
    secondaryGray: {
      100: "#E0E5F2",
      200: "#E1E9F8",
      300: "#F4F7FE",
      400: "#E9EDF7",
      500: "#8F9BBA",
      600: "#A3AED0",
      700: "#707EAE",
      800: "#707EAE",
      900: "#1B2559",
    },
    red: {
      100: "#FEEFEE",
      500: "#EE5D50",
      600: "#E31A1A",
    },
    blue: {
      50: "#EFF4FB",
      500: "#3965FF",
    },
    orange: {
      100: "#FFF6DA",
      500: "#FFB547",
    },
    green: {
      100: "#E6FAF5",
      500: "#01B574",
    },
    navy: {
      50: "#d0dcfb",
      100: "#aac0fe",
      200: "#a3b9f8",
      300: "#728fea",
      400: "#3652ba",
      500: "#1b3bbb",
      600: "#24388a",
      700: "#1B254B",
      800: "#111c44",
      900: "#0b1437",
    },
    gray: {
      100: "#FAFCFE",
    },
  },
  styles: {
    /**
     * Global styles for the application.
     *
     * @param {Object} props The props object.
     * @returns {Object} The global styles object.
     */
    global: (props) => ({
      /**
       * The body of the HTML document.
       */
      body: {
        /**
         * Hide the horizontal scrollbar.
         */
        overflowX: "hidden",
        /**
         * Set the background color of the body to a light gray color in light mode.
         * In dark mode, set the background color to the dark blue color.
         */
        bg: mode("secondaryGray.300", "navy.900")(props),
        /**
         * Set the font family of the body to DM Sans.
         */
        fontFamily: "DM Sans",
        /**
         * Set the letter spacing of the body to -0.5px.
         */
        letterSpacing: "-0.5px",
      },
      /**
       * The input fields.
       */
      input: {
        /**
         * Set the color of the input fields to a dark gray color.
         */
        color: "gray.700",
      },
      /**
       * The HTML element.
       */
      html: {
        /**
         * Set the font family of the HTML element to DM Sans.
         */
        fontFamily: "DM Sans",
      },
    }),
  },
};

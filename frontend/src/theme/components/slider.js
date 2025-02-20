import { mode } from "@chakra-ui/theme-tools";
export const sliderStyles = {
  components: {
    RangeSlider: {
      // baseStyle: {
      //   thumb: {
      //     fontWeight: 400,
      //   },
      //   track: {
      //     display: "flex",
      //   },
      // },

      variants: {
        /**
         * Main variant of the slider.
         * @param {Object} props - props object
         * @returns {Object} - The style object for the main variant
         */
        main: (props) => ({
          /**
           * Style for the thumb.
           * @type {Object}
           */
          thumb: {
            /**
             * Background color of the thumb.
             * @type {string}
             */
            bg: mode("brand.500", "brand.400")(props),
          },
        }),
      },
    },
  },
};

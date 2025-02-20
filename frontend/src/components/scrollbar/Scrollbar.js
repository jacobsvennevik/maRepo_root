import { Box } from "@chakra-ui/react";

import React from "react";


/**
 * Renders a custom track component for a scrollbar.
 *
 * The track is a custom <div> element that is absolutely positioned and has
 * a width of 6px. It is given an opacity of 0 by default and is positioned at
 * the bottom (2px) and top (2px) of the container. It is also given a border
 * radius of 3px. The track is positioned on the right side of the container.
 *
 * @param {Object} style - The style object to be merged with the track's default styles.
 * @param {Object} props - Additional props to be spread onto the track component.
 * @returns {JSX.Element} The rendered track component with combined styles.
 */
export const renderTrack = ({ style, ...props }) => {
  const trackStyle = {
    position: "absolute",
    maxWidth: "100%",
    width: 6,
    transition: "opacity 200ms ease 0s",
    opacity: 0,
    background: "transparent",
    bottom: 2,
    top: 2,
    borderRadius: 3,
    right: 0,
  };
  return <div style={{ ...style, ...trackStyle }} {...props} />;
};
/**
 * Renders a custom thumb component for a scrollbar.
 *
 * The thumb is a custom <div> element. It is given a border radius of 15px and
 * a background color of rgba(222, 222, 222, .1). The style object that is
 * passed in is merged with the thumb's default styles.
 *
 * @param {Object} style - The style object to be merged with the thumb's default styles.
 * @param {Object} props - Additional props to be spread onto the thumb component.
 * @returns {JSX.Element} The rendered thumb component with combined styles.
 */
export const renderThumb = ({ style, ...props }) => {
  const thumbStyle = {
    borderRadius: 15,
    background: "rgba(222, 222, 222, .1)",
  };
  return <div style={{ ...style, ...thumbStyle }} {...props} />;
};

/**
 * Renders a custom view component for a scrollbar.
 *
 * The view is a custom <Box> element. It is given a margin bottom of -22px and
 * a margin end of 0px on base breakpoints and -16px on lg breakpoints. The
 * style object that is passed in is merged with the view's default styles.
 *
 * @param {Object} style - The style object to be merged with the view's default styles.
 * @param {Object} props - Additional props to be spread onto the view component.
 * @returns {JSX.Element} The rendered view component with combined styles.
 */
export const renderView = ({ style, ...props }) => {
  const viewStyle = {
    marginBottom: -22,
  };
  return (
    <Box
      me={{ base: "0px !important", lg: "-16px !important" }}
      style={{ ...style, ...viewStyle }}
      {...props}
    />
  );
};
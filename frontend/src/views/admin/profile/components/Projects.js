// Chakra imports
import { Text, useColorModeValue } from "@chakra-ui/react";
// Assets
import Project1 from "assets/img/profile/Project1.png";
import Project2 from "assets/img/profile/Project2.png";
import Project3 from "assets/img/profile/Project3.png";
// Custom components
import Card from "components/card/Card.js";
import React from "react";
import Project from "views/admin/profile/components/Project";

/**
 * Projects component
 * This component displays all the projects of the user
 * @param {Object} props - The props of the component
 * @returns {JSX.Element} The JSX code of the component
 */
export default function Projects(props) {
  // Chakra Color Mode
  const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "gray.400";
  const cardShadow = useColorModeValue(
    "0px 18px 40px rgba(112, 144, 176, 0.12)",
    "unset"
  );
  return (
    <Card mb={{ base: "0px", "2xl": "20px" }}>
      <Text
        // Title of the section
        color={textColorPrimary}
        fontWeight='bold'
        fontSize='2xl'
        mt='10px'
        mb='4px'>
        All projects
      </Text>
      <Text
        // Description of the section
        color={textColorSecondary}
        fontSize='md'
        me='26px'
        mb='40px'>
        Here you can find more details about your projects. Keep you user
        engaged by providing meaningful information.
      </Text>
      <Project
        // First project
        boxShadow={cardShadow}
        mb='20px'
        image={Project1}
        ranking='1'
        link='#'
        title='Technology behind the Blockchain'
      />
      <Project
        // Second project
        boxShadow={cardShadow}
        mb='20px'
        image={Project2}
        ranking='2'
        link='#'
        title='Greatest way to a good Economy'
      />
      <Project
        // Third project
        boxShadow={cardShadow}
        image={Project3}
        ranking='3'
        link='#'
        title='Most essential tips for Burnout'
      />
    </Card>
  );
}

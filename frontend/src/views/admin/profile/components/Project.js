// Chakra imports
import {
  Box,
  Flex,
  Icon,
  Image,
  Link,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
// Custom components
import Card from "components/card/Card.js";
import React from "react";
// Assets
import { MdEdit } from "react-icons/md";

/**
 * Project component is a single project representation in the projects section.
 * It includes the project title, ranking, link, image and edit link.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.title - The title of the project.
 * @param {number} props.ranking - The ranking of the project.
 * @param {string} props.link - The link to the project.
 * @param {string} props.image - The image of the project.
 * @returns {JSX.Element} The rendered Project component.
 */
export default function Project(props) {
  const { title, ranking, link, image, ...rest } = props;
  // Chakra Color Mode
  const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "gray.400";
  const brandColor = useColorModeValue("brand.500", "white");
  const bg = useColorModeValue("white", "navy.700");
  return (
    <Card bg={bg} {...rest} p='14px'>
      <Flex align='center' direction={{ base: "column", md: "row" }}>
        {/* Project image */}
        <Image h='80px' w='80px' src={image} borderRadius='8px' me='20px' />
        <Box mt={{ base: "10px", md: "0" }}>
          {/* Project title */}
          <Text
            color={textColorPrimary}
            fontWeight='500'
            fontSize='md'
            mb='4px'>
            {title}
          </Text>
          {/* Project description */}
          <Text
            fontWeight='500'
            color={textColorSecondary}
            fontSize='sm'
            me='4px'>
            Project #{ranking} •{" "}
            {/* Project link */}
            <Link
              fontWeight='500'
              color={brandColor}
              href={link}
              fontSize='sm'>
              See project details
            </Link>
          </Text>
        </Box>
        {/* Edit link */}
        <Link
          href={link}
          variant='no-hover'
          me='16px'
          ms='auto'
          p='0px !important'>
          <Icon as={MdEdit} color='secondaryGray.500' h='18px' w='18px' />
        </Link>
      </Flex>
    </Card>
  );
}

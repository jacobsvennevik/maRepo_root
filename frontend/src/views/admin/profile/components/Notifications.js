// Chakra imports
import { Flex, Text, useColorModeValue } from "@chakra-ui/react";
import Card from "components/card/Card.js";
// Custom components
import SwitchField from "components/fields/SwitchField";
import Menu from "components/menu/MainMenu";

/**
 * Notifications component displays a list of toggle switches for enabling or
 * disabling various types of notifications.
 *
 * @param {Object} props - The properties passed to the component.
 * @returns {JSX.Element} The rendered Notifications component.
 */
export default function Notifications(props) {
  const { ...rest } = props;
  // Chakra Color Mode
  const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
  return (
    <Card mb='20px' {...rest}>
      {/* Title and menu */}
      <Flex align='center' w='100%' justify='space-between' mb='30px'>
        <Text
          /* Title text color */
          color={textColorPrimary}
          /* Title font weight and size */
          fontWeight='bold'
          fontSize='2xl'
          mb='4px'>
          Notifications
        </Text>
        {/* Menu component */}
        <Menu />
      </Flex>
      {/* List of toggle switches */}
      <SwitchField
        /* Initial state of the switch */
        isChecked={true}
        /* Reversed switch style */
        reversed={true}
        /* Font size */
        fontSize='sm'
        /* Margin bottom */
        mb='20px'
        /* Switch ID */
        id='1'
        /* Switch label */
        label='Item update notifications'
      />
      <SwitchField
        /* Reversed switch style */
        reversed={true}
        /* Font size */
        fontSize='sm'
        /* Margin bottom */
        mb='20px'
        /* Switch ID */
        id='2'
        /* Switch label */
        label='Item comment notifications'
      />
      <SwitchField
        /* Reversed switch style */
        reversed={true}
        /* Font size */
        fontSize='sm'
        /* Margin bottom */
        mb='20px'
        /* Switch ID */
        id='3'
        /* Switch label */
        label='Buyer review notifications'
      />
      <SwitchField
        /* Reversed switch style */
        reversed={true}
        /* Font size */
        fontSize='sm'
        /* Margin bottom */
        mb='20px'
        /* Switch ID */
        id='4'
        /* Switch label */
        label='Rating reminders notifications'
      />
      <SwitchField
        /* Reversed switch style */
        reversed={true}
        /* Font size */
        fontSize='sm'
        /* Margin bottom */
        mb='20px'
        /* Switch ID */
        id='5'
        /* Switch label */
        label='Meetups near you notifications'
      />
      <SwitchField
        /* Reversed switch style */
        reversed={true}
        /* Font size */
        fontSize='sm'
        /* Margin bottom */
        mb='20px'
        /* Switch ID */
        id='6'
        /* Switch label */
        label='Company news notifications'
      />
      <SwitchField
        /* Reversed switch style */
        reversed={true}
        /* Font size */
        fontSize='sm'
        /* Margin bottom */
        mb='20px'
        /* Switch ID */
        id='7'
        /* Switch label */
        label='New launches and projects'
      />
      <SwitchField
        /* Reversed switch style */
        reversed={true}
        /* Font size */
        fontSize='sm'
        /* Margin bottom */
        mb='20px'
        /* Switch ID */
        id='8'
        /* Switch label */
        label='Monthly product changes'
      />
      <SwitchField
        /* Reversed switch style */
        reversed={true}
        /* Font size */
        fontSize='sm'
        /* Margin bottom */
        mb='20px'
        /* Switch ID */
        id='9'
        /* Switch label */
        label='Subscribe to newsletter'
      />
      <SwitchField
        /* Reversed switch style */
        reversed={true}
        /* Font size */
        fontSize='sm'
        /* Margin bottom */
        mb='20px'
        /* Switch ID */
        id='10'
        /* Switch label */
        label='Email me when someone follows me'
      />
    </Card>
  );
}

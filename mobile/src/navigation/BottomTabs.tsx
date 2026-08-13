import {
  createBottomTabNavigator
} from "@react-navigation/bottom-tabs"

import {
  MaterialIcons
} from "@expo/vector-icons"

import {
  useSafeAreaInsets
} from "react-native-safe-area-context"

import DashboardScreen from "../screens/dashboard/DashboardScreen"
import JobsScreen from "../screens/jobs/JobsScreen"
import CustomersScreen from "../screens/customers/CustomersScreen"
import InventoryScreen from "../screens/inventory/InventoryScreen"
import SettingsScreen from "../screens/settings/SettingsScreen"

import {
  View,
  Text,
  StyleSheet
} from "react-native"

const Tab =
  createBottomTabNavigator()

export default function BottomTabs() {

  const insets =
    useSafeAreaInsets()

  return (

    <Tab.Navigator

      screenOptions={({ route }) => ({

        headerShown: false,

        tabBarActiveTintColor:
          "#2563EB",

        tabBarInactiveTintColor:
          "#9CA3AF",

        tabBarShowLabel: true,

        tabBarHideOnKeyboard:
          true,

        tabBarStyle: {

          height:
            60 + insets.bottom,

          paddingBottom:
            insets.bottom > 0
              ? insets.bottom
              : 10,

          paddingTop: 8,

          borderTopWidth: 1,

          borderTopColor:
            "#E5E7EB",

          backgroundColor:
            "#FFFFFF",

          elevation: 12

        },

        tabBarLabelStyle: {

          fontSize: 11,

          fontWeight: "600",

          marginBottom: 2

        },

        tabBarIconStyle: {

          marginTop: 2

        },

        tabBarIcon: ({
          color,
          size
        }) => {

          let iconName: any

          switch (route.name) {

            case "Dashboard":

              iconName =
                "dashboard"

              break

            case "Jobs":

              iconName =
                "build"

              break

            case "Customers":

              iconName =
                "people"

              break

            case "Inventory":

              iconName =
                "inventory"

              break

            case "Settings":

              iconName =
                "settings"

              break

            default:

              iconName =
                "dashboard"

          }

          return (

            <MaterialIcons
              name={iconName}
              size={size}
              color={color}
            />

          )

        }

      })}

    >

      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
      />

      <Tab.Screen
        name="Jobs"
        component={JobsScreen}
      />

      <Tab.Screen
        name="Customers"
        component={CustomersScreen}
      />

      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
      />

    </Tab.Navigator>

  )

}
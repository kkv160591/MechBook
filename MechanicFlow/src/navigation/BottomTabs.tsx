import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"

import {
  MaterialIcons
} from "@expo/vector-icons"

import DashboardScreen from "../screens/dashboard/DashboardScreen"
import JobsScreen from "../screens/jobs/JobsScreen"
import CustomersScreen from "../screens/customers/CustomersScreen"
import InventoryScreen from "../screens/inventory/InventoryScreen"

import {
  View,
  Text,
  StyleSheet
} from "react-native"

const Tab = createBottomTabNavigator()

function SettingsScreen() {

  return (

    <View style={styles.placeholder}>

      <MaterialIcons
        name="settings"
        size={60}
        color="#9CA3AF"
      />

      <Text style={styles.placeholderText}>
        Settings Screen
      </Text>

    </View>

  )

}

export default function BottomTabs() {

  return (

    <Tab.Navigator

      screenOptions={({ route }) => ({

        headerShown: false,

        tabBarActiveTintColor: "#2563EB",

        tabBarInactiveTintColor: "#9CA3AF",

        tabBarShowLabel: true,

        tabBarStyle: {
          height: 72,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 0,
          backgroundColor: "white",
          elevation: 10
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600"
        },

        tabBarIcon: ({ color, size }) => {

          let iconName: any

          if (route.name === "Dashboard") {
            iconName = "dashboard"
          }

          else if (route.name === "Jobs") {
            iconName = "build"
          }

          else if (route.name === "Customers") {
            iconName = "people"
          }

          else if (route.name === "Inventory") {
            iconName = "inventory"
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

    </Tab.Navigator>

  )

}

const styles = StyleSheet.create({

  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6"
  },

  placeholderText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280"
  }

})
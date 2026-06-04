import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { MaterialIcons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

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

  const insets = useSafeAreaInsets()

  return (

    <Tab.Navigator

      screenOptions={({ route }) => ({

        headerShown: false,

        tabBarActiveTintColor: "#2563EB",

        tabBarInactiveTintColor: "#9CA3AF",

        tabBarShowLabel: true,

        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          backgroundColor: "#FFFFFF",
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

        tabBarIcon: ({ color, size }) => {

          let iconName: any

          switch (route.name) {

            case "Dashboard":
              iconName = "dashboard"
              break

            case "Jobs":
              iconName = "build"
              break

            case "Customers":
              iconName = "people"
              break

            case "Inventory":
              iconName = "inventory"
              break

            default:
              iconName = "dashboard"

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
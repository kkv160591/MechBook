import React from "react"
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions
} from "@react-navigation/bottom-tabs"
import { MaterialIcons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import DashboardScreen from "../screens/dashboard/DashboardScreen"
import JobsScreen from "../screens/jobs/JobsScreen"
import CustomersScreen from "../screens/customers/CustomersScreen"
import InventoryScreen from "../screens/inventory/InventoryScreen"
import SettingsScreen from "../screens/settings/SettingsScreen"

import { useAuth } from "../context/AuthContext"
import { useTranslation } from "../context/LanguageContext"

// Define your tab navigator param list for strict route type checking
export type BottomTabParamList = {
  Dashboard: undefined
  Jobs: undefined
  Customers: undefined
  Inventory: undefined
  Settings: undefined
}

const Tab = createBottomTabNavigator<BottomTabParamList>()

export default function BottomTabs() {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const { t } = useTranslation()

  const isWorker = user?.role?.toLowerCase() === "worker"

  return (
    <Tab.Navigator
      screenOptions={({ route }): BottomTabNavigationOptions => ({
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
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap

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
            case "Settings":
              iconName = "settings"
              break
            default:
              iconName = "dashboard"
          }

          return <MaterialIcons name={iconName} size={size} color={color} />
        }
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: t("navigation.dashboard") || "Dashboard"
        }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobsScreen}
        options={{
          tabBarLabel: t("navigation.jobs") || "Jobs"
        }}
      />

      {/* Owner-Only Tabs */}
      {!isWorker && (
        <>
          <Tab.Screen
            name="Customers"
            component={CustomersScreen}
            options={{
              tabBarLabel: t("navigation.customers") || "Customers"
            }}
          />
          <Tab.Screen
            name="Inventory"
            component={InventoryScreen}
            options={{
              tabBarLabel: t("navigation.inventory") || "Inventory"
            }}
          />
        </>
      )}

      {/* Shared Tab */}
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t("navigation.settings") || "Settings"
        }}
      />
    </Tab.Navigator>
  )
}
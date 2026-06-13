import { createNativeStackNavigator } from "@react-navigation/native-stack"

import LoginScreen from "../screens/auth/LoginScreen"
import BottomTabs from "./BottomTabs"
import CreateJobScreen from "../screens/jobs/CreateJobScreen"
import JobsScreen from "../screens/jobs/JobsScreen"
import JobDetailScreen from "../screens/jobs/JobDetailScreen"
import InvoiceScreen from "../screens/invoices/InvoiceScreen"
import CustomerDetailScreen from "../screens/customers/CustomerDetailScreen"
import AddCustomerScreen from "../screens/customers/AddCustomerScreen"
import InventoryScreen from "../screens/inventory/InventoryScreen"
import PartDetailsScreen from "../screens/inventory/PartDetailsScreen"
import AddEditPartScreen from "../screens/inventory/AddEditPartScreen"
import SettingsScreen from "../screens/settings/SettingsScreen"
import GarageProfileScreen from "../screens/settings/GarageProfileScreen"
import WorkersScreen from "../screens/settings/WorkersScreen"
import WorkerAccountsScreen from "../screens/settings/WorkerAccountsScreen"
import WorkerDetailsScreen from "../screens/settings/WorkerDetailsScreen"
import AddWorkerScreen from "../screens/settings/AddWorkerScreen"
import LoginHistoryScreen from "../screens/settings/LoginHistoryScreen"
import ServiceTypesScreen from "../screens/settings/ServiceTypesScreen"
import AddServiceTypeScreen from "../screens/settings/AddServiceTypeScreen"
import EditServiceTypeScreen from "../screens/settings/EditServiceTypeScreen"
import GSTConfigScreen from "../screens/settings/GSTConfigScreen"
import InvoiceSettingsScreen from "../screens/settings/InvoiceSettingsScreen"
import BackupScreen from "../screens/settings/BackupScreen"
import PlanUsageScreen from "../screens/settings/PlanUsageScreen"
import LanguageScreen from "../screens/settings/LanguageScreen"
import RegisterScreen from "../screens/auth/RegisterScreen"

import { RootStackParamList } from "../types/navigation"

import {
  useAuth
} from "../context/AuthContext"

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function AppNavigator() {

  const {
    user,
    loading
  } = useAuth()

  if (loading) {
    return null
  }

  return (

    <Stack.Navigator
      initialRouteName={
        user
          ? "Dashboard"
          : "Login"
      }
    >

      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
      />

      <Stack.Screen
        name="Dashboard"
        component={BottomTabs}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CreateJob"
        component={CreateJobScreen}
        options={{ title: "Create Job" }}
      />

      <Stack.Screen
        name="Jobs"
        component={JobsScreen}
      />

      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
      />

      <Stack.Screen 
        name="Invoice" 
        component={InvoiceScreen} 
      />

      <Stack.Screen
        name="CustomerDetail"
        component={CustomerDetailScreen}
      />

      <Stack.Screen
        name="AddCustomer"
        component={AddCustomerScreen}
      />

      <Stack.Screen
        name="Inventory"
        component={InventoryScreen}
      />

      <Stack.Screen
        name="PartDetails"
        component={PartDetailsScreen}
      />

      <Stack.Screen
        name="AddEditPart"
        component={AddEditPartScreen}
      />

      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
      />

      <Stack.Screen
        name="GarageProfile"
        component={GarageProfileScreen}
      />

      <Stack.Screen
        name="Workers"
        component={WorkersScreen}
      />

      <Stack.Screen
        name="WorkerAccounts"
        component={WorkerAccountsScreen}
      />

      <Stack.Screen
        name="WorkerDetails"
        component={WorkerDetailsScreen}
      />

      <Stack.Screen
        name="LoginHistory"
        component={LoginHistoryScreen}
      />

      <Stack.Screen
        name="AddWorker"
        component={AddWorkerScreen}
      />

      <Stack.Screen
        name="ServiceTypes"
        component={ServiceTypesScreen}
      />

      <Stack.Screen
        name="AddServiceType"
        component={AddServiceTypeScreen}
      />

      <Stack.Screen
        name="EditServiceType"
        component={EditServiceTypeScreen}
      />

      <Stack.Screen
        name="GSTConfig"
        component={GSTConfigScreen}
      />

      <Stack.Screen
        name="InvoiceSettings"
        component={InvoiceSettingsScreen}
      />

      <Stack.Screen
        name="Backup"
        component={BackupScreen}
      />

      <Stack.Screen
        name="Language"
        component={LanguageScreen}
      />

      <Stack.Screen
        name="PlanUsage"
        component={PlanUsageScreen}
        options={{
          title: "Subscription & Billing"
        }}
      />

    </Stack.Navigator>

  )

}
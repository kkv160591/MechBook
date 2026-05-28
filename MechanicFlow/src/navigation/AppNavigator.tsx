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

import { RootStackParamList } from "../types/navigation"

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function AppNavigator() {

  return (

    <Stack.Navigator initialRouteName="Dashboard">

      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
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

    </Stack.Navigator>

  )

}
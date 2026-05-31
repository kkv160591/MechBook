import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet
} from "react-native"

import {
  MaterialIcons,
  Ionicons,
  Feather
} from "@expo/vector-icons"

import { useNavigation } from "@react-navigation/native"

export default function SettingsScreen() {

  const navigation: any = useNavigation()

  const menus = [
    {
      title: "Garage Profile",
      subtitle: "Name, address, GST, logo",
      icon: "storefront",
      screen: "GarageProfile"
    },
    {
      title: "Workers",
      subtitle: "Manage mechanics & staff",
      icon: "people",
      screen: "Workers"
    },
    {
      title: "Service Types",
      subtitle: "Manage available services",
      icon: "build",
      screen: "ServiceTypes"
    },
    {
      title: "GST Configuration",
      subtitle: "Default GST settings",
      icon: "receipt-long",
      screen: "GSTConfig"
    },
    {
      title: "Invoice Settings",
      subtitle: "PDF & invoice customization",
      icon: "description",
      screen: "InvoiceSettings"
    },
    {
      title: "Data Backup",
      subtitle: "Cloud backup management",
      icon: "cloud-upload",
      screen: "Backup"
    },
    {
      title: "Plan & Usage",
      subtitle: "Subscription information",
      icon: "workspace-premium",
      screen: "PlanUsage"
    },
    {
      title: "Language",
      subtitle: "Hindi, Tamil, Telugu etc",
      icon: "language",
      screen: "Language"
    }
  ]

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      <Text style={styles.title}>
        Settings
      </Text>

      <Text style={styles.subtitle}>
        Garage configuration & account management
      </Text>

      {menus.map(item => (

        <TouchableOpacity
          key={item.title}
          style={styles.card}
          onPress={() =>
            navigation.navigate(item.screen)
          }
        >

          <View style={styles.iconBox}>

            <MaterialIcons
              name={item.icon as any}
              size={22}
              color="#2563EB"
            />

          </View>

          <View style={{ flex: 1 }}>

            <Text style={styles.cardTitle}>
              {item.title}
            </Text>

            <Text style={styles.cardSubtitle}>
              {item.subtitle}
            </Text>

          </View>

          <Feather
            name="chevron-right"
            size={20}
            color="#9CA3AF"
          />

        </TouchableOpacity>

      ))}

      <View style={{ height: 40 }} />

    </ScrollView>

  )

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 18
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111827"
  },

  subtitle: {
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 20
  },

  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14
  },

  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#111827"
  },

  cardSubtitle: {
    color: "#6B7280",
    marginTop: 4
  }

})
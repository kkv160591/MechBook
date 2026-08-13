import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native"

import {
  MaterialIcons,
  Feather
} from "@expo/vector-icons"

import {
  useNavigation
} from "@react-navigation/native"

import {
  useAuth
} from "../../context/AuthContext"

export default function SettingsScreen() {

  const navigation: any = useNavigation()

  const {
    logout
  } = useAuth()

  const sections = [
    {
      title: "Garage",
      items: [
        {
          title: "Garage Profile",
          subtitle: "Name, address, GST, logo",
          icon: "storefront",
          screen: "GarageProfile"
        }
      ]
    },

    {
      title: "Operations",
      items: [
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
        }
      ]
    },

    {
      title: "Billing & Invoices",
      items: [
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
        }
      ]
    },

    {
      title: "Data & Account",
      items: [
        {
          title: "Data Backup",
          subtitle: "Cloud backup management",
          icon: "cloud-upload",
          screen: "Backup"
        },
        {
          title: "Plan & Usage",
          subtitle: "Subscription and usage information",
          icon: "workspace-premium",
          screen: "PlanUsage"
        },
        {
          title: "Language",
          subtitle: "Hindi, Tamil, Telugu etc.",
          icon: "language",
          screen: "Language"
        }
      ]
    }
  ]

  const handleLogout = () => {

    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {

            try {

              await logout()

            }

            catch (error) {

              console.log(
                "Logout error:",
                error
              )

              Alert.alert(
                "Logout Failed",
                "Unable to logout. Please try again."
              )

            }

          }
        }
      ]
    )

  }

  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}

      <View style={styles.header}>

        <Text style={styles.title}>
          Settings
        </Text>

        <Text style={styles.subtitle}>
          Manage your garage configuration and account
        </Text>

      </View>

      {/* SETTINGS SECTIONS */}

      {sections.map(section => (

        <View
          key={section.title}
          style={styles.section}
        >

          <Text style={styles.sectionTitle}>
            {section.title}
          </Text>

          <View style={styles.sectionCard}>

            {section.items.map((item, index) => (

              <View key={item.title}>

                <TouchableOpacity
                  style={styles.menuItem}
                  activeOpacity={0.7}
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

                  <View style={styles.textContainer}>

                    <Text style={styles.menuTitle}>
                      {item.title}
                    </Text>

                    <Text style={styles.menuSubtitle}>
                      {item.subtitle}
                    </Text>

                  </View>

                  <Feather
                    name="chevron-right"
                    size={20}
                    color="#9CA3AF"
                  />

                </TouchableOpacity>

                {index <
                  section.items.length - 1 && (

                  <View style={styles.divider} />

                )}

              </View>

            ))}

          </View>

        </View>

      ))}

      {/* LOGOUT */}

      <View style={styles.logoutSection}>

        <Text style={styles.sectionTitle}>
          Account
        </Text>

        <TouchableOpacity
          style={styles.logoutCard}
          activeOpacity={0.7}
          onPress={handleLogout}
        >

          <View style={styles.logoutIconBox}>

            <MaterialIcons
              name="logout"
              size={22}
              color="#DC2626"
            />

          </View>

          <View style={styles.textContainer}>

            <Text style={styles.logoutTitle}>
              Logout
            </Text>

            <Text style={styles.logoutSubtitle}>
              Sign out of your GarageBook account
            </Text>

          </View>

          <Feather
            name="chevron-right"
            size={20}
            color="#F87171"
          />

        </TouchableOpacity>

      </View>

      <View style={styles.bottomSpace} />

    </ScrollView>

  )

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6"
  },

  content: {
    padding: 18,
    paddingBottom: 40
  },

  header: {
    marginBottom: 26
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111827"
  },

  subtitle: {
    color: "#6B7280",
    marginTop: 5,
    fontSize: 14,
    lineHeight: 20
  },

  section: {
    marginBottom: 22
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 9,
    marginLeft: 4
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden"
  },

  menuItem: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13
  },

  textContainer: {
    flex: 1,
    paddingRight: 10
  },

  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827"
  },

  menuSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 18
  },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 74
  },

  logoutSection: {
    marginTop: 2,
    marginBottom: 10
  },

  logoutCard: {
    minHeight: 78,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12
  },

  logoutIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13
  },

  logoutTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#DC2626"
  },

  logoutSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
    lineHeight: 18
  },

  bottomSpace: {
    height: 20
  }

})
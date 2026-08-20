import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal
} from "react-native"
import { useState } from "react"
import { MaterialIcons, Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useAuth } from "../../context/AuthContext"
import { useTranslation } from "../../context/LanguageContext"

export default function SettingsScreen() {
  const navigation: any = useNavigation()
  const { user, logout } = useAuth()
  const { t } = useTranslation()

  const [logoutVisible, setLogoutVisible] = useState(false)

  const sections = [
    {
      title: t("settings.sections.garage") || "Garage",
      items: [
        {
          title: t("settings.items.garageProfile.title") || "Garage Profile",
          subtitle:
            t("settings.items.garageProfile.subtitle") ||
            "Name, address, GST, logo",
          icon: "storefront",
          screen: "GarageProfile"
        }
      ]
    },
    {
      title: t("settings.sections.operations") || "Operations",
      items: [
        {
          title: t("settings.items.workers.title") || "Workers",
          subtitle:
            t("settings.items.workers.subtitle") ||
            "Manage mechanics & staff",
          icon: "people",
          screen: "Workers"
        },
        {
          title: t("settings.items.serviceTypes.title") || "Service Types",
          subtitle:
            t("settings.items.serviceTypes.subtitle") ||
            "Manage available services",
          icon: "build",
          screen: "ServiceTypes"
        }
      ]
    },
    {
      title: t("settings.sections.billing") || "Billing & Invoices",
      items: [
        {
          title: t("settings.items.gstConfig.title") || "GST Configuration",
          subtitle:
            t("settings.items.gstConfig.subtitle") || "Default GST settings",
          icon: "receipt-long",
          screen: "GSTConfig"
        },
        {
          title:
            t("settings.items.invoiceSettings.title") || "Invoice Settings",
          subtitle:
            t("settings.items.invoiceSettings.subtitle") ||
            "PDF & invoice customization",
          icon: "description",
          screen: "InvoiceSettings"
        }
      ]
    },
    {
      title: t("settings.sections.dataAccount") || "Data & Account",
      items: [
        {
          title: t("settings.items.backup.title") || "Data Backup",
          subtitle:
            t("settings.items.backup.subtitle") || "Cloud backup management",
          icon: "cloud-upload",
          screen: "Backup"
        },
        {
          title: t("settings.items.plan.title") || "Plan & Usage",
          subtitle:
            t("settings.items.plan.subtitle") ||
            "Subscription and usage information",
          icon: "workspace-premium",
          screen: "PlanUsage"
        },
        {
          title: t("settings.items.language.title") || "Language",
          subtitle:
            t("settings.items.language.subtitle") ||
            "Hindi, Tamil, Telugu etc.",
          icon: "language",
          screen: "Language"
        }
      ]
    }
  ]

  const handleLogout = () => {
    setLogoutVisible(true)
  }

  const confirmLogout = async () => {
    try {
      setLogoutVisible(false)
      await logout()
    } catch (error) {
      console.log("Logout error:", error)
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER WITH PROFILE BADGE */}
      <View style={styles.header}>
        <Text style={styles.title}>{t("settings.title") || "Settings"}</Text>
        <Text style={styles.subtitle}>
          {t("settings.subtitle") ||
            "Manage your garage configuration and account"}
        </Text>
      </View>

      {/* SETTINGS SECTIONS */}
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>

          <View style={styles.sectionCard}>
            {section.items.map((item, index) => (
              <View key={item.title}>
                <TouchableOpacity
                  style={styles.menuItem}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate(item.screen)}
                >
                  <View style={styles.iconBox}>
                    <MaterialIcons
                      name={item.icon as any}
                      size={22}
                      color="#2563EB"
                    />
                  </View>

                  <View style={styles.textContainer}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>

                  <Feather name="chevron-right" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {index < section.items.length - 1 && (
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
          {t("settings.sections.account") || "Account"}
        </Text>

        <TouchableOpacity
          style={styles.logoutCard}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <View style={styles.logoutIconBox}>
            <MaterialIcons name="logout" size={22} color="#DC2626" />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.logoutTitle}>
              {t("settings.logout.title") || "Logout"}
            </Text>
            <Text style={styles.logoutSubtitle}>
              {t("settings.logout.subtitle") ||
                "Sign out of your GarageBook account"}
            </Text>
          </View>

          <Feather name="chevron-right" size={20} color="#F87171" />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpace} />

      {/* CONFIRMATION MODAL */}
      <Modal
        visible={logoutVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.logoutModal}>
            <View style={styles.modalIcon}>
              <MaterialIcons name="logout" size={28} color="#DC2626" />
            </View>

            <Text style={styles.modalTitle}>
              {t("settings.logout.modalTitle") || "Logout"}
            </Text>

            <Text style={styles.modalMessage}>
              {t("settings.logout.modalMessage") ||
                "Are you sure you want to logout from your GarageBook account?"}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.8}
                onPress={() => setLogoutVisible(false)}
              >
                <Text style={styles.cancelButtonText}>
                  {t("common.cancel") || "Cancel"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                activeOpacity={0.8}
                onPress={confirmLogout}
              >
                <Text style={styles.confirmButtonText}>
                  {t("settings.logout.confirm") || "Logout"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 22
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
  profileBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700"
  },
  profileTextContainer: {
    justifyContent: "center"
  },
  ownerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827"
  },
  phoneText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24
  },
  logoutModal: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 24,
    alignItems: "center"
  },
  modalIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8
  },
  modalMessage: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24
  },
  modalActions: {
    width: "100%",
    flexDirection: "row",
    gap: 12
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center"
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151"
  },
  confirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center"
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF"
  }
})
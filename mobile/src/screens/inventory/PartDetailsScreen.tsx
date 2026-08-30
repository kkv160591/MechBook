import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native"

import { RouteProp, useNavigation } from "@react-navigation/native"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useTranslation } from "../../context/LanguageContext"
import { removeInventory } from "../../services/inventoryService"

type Props = {
  route: RouteProp<any, any>
}

export default function PartDetailsScreen({ route }: Props) {
  const navigation: any = useNavigation()
  const { t } = useTranslation()

  const { part } = route.params
  const lowStock = part.stock <= part.minStock
  const partId = part.partId || part.inventoryId || part._id

  const handleDelete = () => {
    Alert.alert(
      t("inventory.deleteConfirmTitle") || "Delete Part",
      t("inventory.deleteConfirmMessage") || "Are you sure you want to delete this part? This action cannot be undone.",
      [
        {
          text: t("common.cancel") || "Cancel",
          style: "cancel"
        },
        {
          text: t("common.delete") || "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await removeInventory(partId)
              Alert.alert(
                t("common.successTitle") || "Success",
                t("inventory.messages.deleteSuccess") || "Part deleted successfully"
              )
              navigation.goBack()
            } catch (error: any) {
              Alert.alert(
                t("common.errorTitle") || "Error",
                error?.response?.data?.message || t("common.somethingWentWrong") || "Failed to delete part"
              )
            }
          }
        }
      ]
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER BAR */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>{t("inventory.partDetails") || "Part Details"}</Text>
            <Text style={styles.subtitle}>{part.name}</Text>
          </View>
        </View>

        <View style={styles.headerIconBox}>
          <Ionicons name="cube" size={28} color="#2563EB" />
        </View>
      </View>

      {/* ITEM SUMMARY CARD */}
      <View style={styles.headerCard}>
        <View style={styles.iconBox}>
          <MaterialIcons name="inventory" size={34} color="#2563EB" />
        </View>

        <Text style={styles.name}>{part.name}</Text>
        <Text style={styles.sku}>{part.sku || "N/A"}</Text>

        <View
          style={[
            styles.stockBadge,
            { backgroundColor: lowStock ? "#FEE2E2" : "#DCFCE7" },
          ]}
        >
          <Text
            style={[
              styles.stockText,
              { color: lowStock ? "#DC2626" : "#16A34A" },
            ]}
          >
            {part.stock} {t("inventory.inStock")}
          </Text>
        </View>
      </View>

      {/* DETAILS SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("inventory.partDetails")}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>{t("inventory.labels.category")}</Text>
          <Text style={styles.value}>{part.category}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>{t("inventory.labels.buyingPrice")}</Text>
          <Text style={styles.value}>₹{part.buyingPrice}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>{t("inventory.labels.sellingPrice")}</Text>
          <Text style={styles.value}>₹{part.sellingPrice}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>{t("inventory.labels.minStock")}</Text>
          <Text style={styles.value}>{part.minStock}</Text>
        </View>
      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() =>
            navigation.navigate("AddEditPart", {
              mode: "edit",
              part,
            })
          }
        >
          <MaterialIcons name="edit" size={20} color="white" />
          <Text style={styles.actionText}>{t("inventory.editPart") || "Edit Part"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDelete}
        >
          <MaterialIcons name="delete-outline" size={20} color="#DC2626" />
          <Text style={styles.deleteText}>{t("common.delete") || "Delete Part"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    marginTop: 2,
    color: "#6B7280",
    fontSize: 13,
  },
  headerIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 18,
    color: "#111827",
  },
  sku: {
    color: "#6B7280",
    marginTop: 6,
  },
  stockBadge: {
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
  },
  stockText: {
    fontWeight: "bold",
  },
  section: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#111827",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  label: {
    color: "#6B7280",
  },
  value: {
    fontWeight: "bold",
    color: "#111827",
  },
  actionContainer: {
    marginTop: 20,
    marginBottom: 40,
    gap: 12,
  },
  editBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  actionText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
  deleteBtn: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  deleteText: {
    color: "#DC2626",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
})
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert
} from "react-native"
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons"
import { useEffect, useState, useCallback } from "react"
import { useFocusEffect } from "@react-navigation/native"
import { getWorkers } from "../../services/workerService"
import { useTranslation } from "../../context/LanguageContext"

interface Worker {
  workerId: string
  garageId: string
  name: string
  role: string
  phone: string
  active: boolean
  createdAt: string
}

export default function WorkersScreen({ navigation }: any) {
  const { t } = useTranslation()
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  // Refetch list whenever screen comes into focus (e.g. returning from WorkerDetails or AddWorker)
  useFocusEffect(
    useCallback(() => {
      loadWorkers()
    }, [])
  )

  const loadWorkers = async () => {
    try {
      const response = await getWorkers()
      // Handles response structure: { success: true, workers: [...] }
      if (response?.success && Array.isArray(response.workers)) {
        setWorkers(response.workers)
      } else if (Array.isArray(response)) {
        setWorkers(response)
      } else {
        setWorkers([])
      }
    } catch (error) {
      console.error("Failed to load workers:", error)
      Alert.alert(
        t("common.errorTitle") || "Error",
        t("workers.addError") || "Failed to fetch workers list"
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadWorkers()
  }

  const renderWorkerCard = ({ item }: { item: Worker }) => {
    const workerId = item.workerId || (item as any)._id || (item as any).id

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => {
          if (workerId) {
            navigation.navigate("WorkerDetails", { workerId })
          } else {
            console.warn("Worker item is missing a valid identifier:", item)
          }
        }}
      >
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={24} color="#2563EB" />
        </View>

        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>{item.name}</Text>
          <Text style={styles.workerRole}>{item.role}</Text>
          <Text style={styles.workerPhone}>{item.phone}</Text>
        </View>

        <View style={styles.badgeAndArrow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item.active ? "#DCFCE7" : "#FEE2E2" }
            ]}
          >
            <Text
              style={{
                color: item.active ? "#16A34A" : "#DC2626",
                fontWeight: "700",
                fontSize: 11
              }}
            >
              {item.active
                ? t("workers.active") || "ACTIVE"
                : t("workers.inactive") || "INACTIVE"}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      {/* Top Header Bar / Back Button & Add Button */}
      <View style={styles.headerContainer}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color="#111827" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>
              {t("workers.title") || "Worker Management"}
            </Text>
            <Text style={styles.headerSubtitle}>
              {workers.length} {workers.length === 1 ? "Worker" : "Workers"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("AddWorker")}
        >
          <MaterialIcons name="add" size={20} color="white" />
          <Text style={styles.addBtnText}>
            {t("workers.addWorker") || "Add Worker"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>
            {t("workers.loading") || "Loading workers..."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={workers}
          keyExtractor={(item, index) =>
            item.workerId || (item as any)._id || index.toString()
          }
          renderItem={renderWorkerCard}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="people-outline" size={60} color="#9CA3AF" />
              <Text style={styles.emptyText}>
                {t("workers.noWorkers") || "No workers found"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingTop: 16
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  headerLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827"
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2
  },
  addBtn: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12
  },
  addBtnText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 4,
    fontSize: 13
  },
  listContent: {
    paddingBottom: 24
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center"
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  workerInfo: {
    flex: 1
  },
  workerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827"
  },
  workerRole: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 2
  },
  workerPhone: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2
  },
  badgeAndArrow: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 44
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280"
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60
  },
  emptyText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "500"
  }
})
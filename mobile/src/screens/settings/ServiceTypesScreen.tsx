import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Text
} from "react-native"
import { Ionicons, Feather } from "@expo/vector-icons"
import { useState, useCallback } from "react"
import { useFocusEffect } from "@react-navigation/native"
import ServiceTypeCard from "../../components/settings/ServiceTypeCard"
import { getServiceTypes } from "../../services/serviceTypesService"
import { useTranslation } from "../../context/LanguageContext"

export default function ServiceTypesScreen({ navigation }: any) {
  const { t } = useTranslation()

  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadServices = async () => {
    try {
      setLoading(true)
      const response = await getServiceTypes()
      setServices(response?.services || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadServices()
    }, [])
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>
          {t("services.loading") || "Loading Services..."}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header Bar with Back Button */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.heading}>
            {t("services.serviceTypesTitle") || "Service Types"}
          </Text>
          <Text style={styles.subHeading}>
            {t("services.serviceTypesSubtitle") || "Manage service catalog"}
          </Text>
        </View>
      </View>

      <FlatList
        data={services}
        keyExtractor={(item) => item.serviceTypeId}
        renderItem={({ item }) => (
          <ServiceTypeCard
            service={item}
            onPress={() =>
              navigation.navigate("EditServiceType", {
                serviceId: item.serviceTypeId
              })
            }
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {t("services.noServices") || "No Services Added"}
            </Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("AddServiceType")}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 6
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
  headerTextContainer: {
    flex: 1
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827"
  },
  subHeading: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 2
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 14
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: "center"
  },
  emptyText: {
    fontSize: 15,
    color: "#6B7280"
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  }
})
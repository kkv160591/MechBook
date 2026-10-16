
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useState, useCallback, useMemo } from "react"
import { useFocusEffect } from "@react-navigation/native"
import { getServiceTypes } from "../../services/serviceTypesService"
import { useTranslation } from "../../context/LanguageContext"

const PAGE_SIZE = 20

type ServiceType = {
  serviceTypeId: string
  name: string
  category?: string
  defaultPrice?: number
  estimatedDuration?: string
  active?: boolean
  createdAt?: string
}

type FilterValue = "all" | "active" | "inactive"
type SortValue = "recent" | "oldest" | "name" | "price"

export default function ServiceTypesScreen({ navigation }: any) {
  const { t } = useTranslation()

  const [services, setServices] = useState<ServiceType[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterValue>("all")
  const [sort, setSort] = useState<SortValue>("recent")
  const [sheet, setSheet] = useState<"filter" | "sort" | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const loadServices = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const response = await getServiceTypes()
      setServices(response?.services || [])
    } catch (error) {
      console.error("Failed to load service types:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadServices()
    }, [loadServices])
  )

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase()

    const result = services.filter((service) => {
      const matchesSearch =
        !query ||
        service.name?.toLowerCase().includes(query) ||
        service.category?.toLowerCase().includes(query) ||
        service.estimatedDuration?.toLowerCase().includes(query)

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && service.active === true) ||
        (filter === "inactive" && service.active === false)

      return matchesSearch && matchesFilter
    })

    return result.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return (
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
          )
        case "name":
          return (a.name || "").localeCompare(b.name || "")
        case "price":
          return (b.defaultPrice || 0) - (a.defaultPrice || 0)
        case "recent":
        default:
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          )
      }
    })
  }, [services, search, filter, sort])

  const visibleServices = filteredServices.slice(0, visibleCount)

  const filterOptions: { label: string; value: FilterValue }[] = [
    { label: t("services.allServices"), value: "all" },
    { label: t("common.active"), value: "active" },
    { label: t("common.inactive"), value: "inactive" },
  ]

  const sortOptions: { label: string; value: SortValue }[] = [
    { label: t("common.recentlyAdded"), value: "recent" },
    { label: t("common.oldestFirst"), value: "oldest" },
    { label: t("common.nameAZ"), value: "name" },
    { label: t("common.highestPrice"), value: "price" },
  ]

  const activeFilterLabel =
    filterOptions.find((option) => option.value === filter)?.label ||
    t("common.filter")

  const activeSortLabel =
    sortOptions.find((option) => option.value === sort)?.label ||
    t("common.sort")

  const formatPrice = (price?: number) =>
    `₹${(price || 0).toLocaleString("en-IN")}`

  const renderService = ({ item }: { item: ServiceType }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() =>
        navigation.navigate("EditServiceType", {
          serviceId: item.serviceTypeId,
        })
      }
    >
      <View style={styles.serviceIcon}>
        <Ionicons name="construct-outline" size={21} color="#2563EB" />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.topRow}>
          <Text style={styles.serviceName} numberOfLines={1}>
            {item.name}
          </Text>

          <View
            style={[
              styles.statusBadge,
              item.active ? styles.activeBadge : styles.inactiveBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.active ? styles.activeText : styles.inactiveText,
              ]}
            >
              {item.active ? t("common.active") : t("common.inactive")}
            </Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.metaContainer}>
            {!!item.category && (
              <Text style={styles.category} numberOfLines={1}>
                {item.category}
              </Text>
            )}

            {!!item.estimatedDuration && (
              <Text style={styles.duration} numberOfLines={1}>
                {item.estimatedDuration}
              </Text>
            )}
          </View>

          <Text style={styles.price}>{formatPrice(item.defaultPrice)}</Text>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#9CA3AF"
        style={styles.chevron}
      />
    </TouchableOpacity>
  )

  const renderSheet = () => {
    if (!sheet) return null

    const isFilter = sheet === "filter"
    const options = isFilter ? filterOptions : sortOptions
    const selectedValue = isFilter ? filter : sort

    return (
      <Modal
        visible
        transparent
        animationType="slide"
        onRequestClose={() => setSheet(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSheet(null)}
        >
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {isFilter ? t("common.filterServices") : t("common.sortServices")}
              </Text>
              <TouchableOpacity onPress={() => setSheet(null)}>
                <Ionicons name="close" size={23} color="#475569" />
              </TouchableOpacity>
            </View>

            {options.map((option) => {
              const selected = option.value === selectedValue

              return (
                <TouchableOpacity
                  key={option.value}
                  style={styles.optionRow}
                  onPress={() => {
                    if (isFilter) {
                      setFilter(option.value as FilterValue)
                    } else {
                      setSort(option.value as SortValue)
                    }
                    setVisibleCount(PAGE_SIZE)
                    setSheet(null)
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.selectedOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>

                  {selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={21}
                      color="#2563EB"
                    />
                  )}
                </TouchableOpacity>
              )
            })}

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setSheet(null)}
            >
              <Text style={styles.doneButtonText}>{t("common.done")}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={21} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.title}>{t("services.title")}</Text>
          <Text style={styles.subtitle}>
            {`${services.length} ${t("services.count")}`}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddServiceType")}
        >
          <Ionicons name="add" size={19} color="#FFFFFF" />
          <Text style={styles.addButtonText}>{t("common.add")}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchControlsRow}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color="#94A3B8"
          />
          <TextInput
            style={styles.searchInput}
            placeholder={t("services.searchPlaceholder")}
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            numberOfLines={1}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color="#94A3B8"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter */}
        <TouchableOpacity
          style={[
            styles.compactControlButton,
            filter !== "all" && styles.controlButtonActive,
          ]}
          onPress={() => setSheet("filter")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="filter-outline"
            size={17}
            color={filter !== "all" ? "#2563EB" : "#475569"}
          />
          {filter !== "all" && (
            <View style={styles.activeFilterDot} />
          )}
        </TouchableOpacity>

        {/* Sort */}
        <TouchableOpacity
          style={[
            styles.compactControlButton,
            sort !== "recent" && styles.controlButtonActive,
          ]}
          onPress={() => setSheet("sort")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="swap-vertical-outline"
            size={17}
            color={sort !== "recent" ? "#2563EB" : "#475569"}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={visibleServices}
        keyExtractor={(item) => item.serviceTypeId}
        renderItem={renderService}
        contentContainerStyle={[
          styles.listContent,
          visibleServices.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadServices(true)}
            tintColor="#2563EB"
          />
        }
        onEndReached={() => {
          if (visibleCount < filteredServices.length) {
            setVisibleCount((count) => count + PAGE_SIZE)
          }
        }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="construct-outline"
                size={29}
                color="#94A3B8"
              />
            </View>
            <Text style={styles.emptyTitle}>
              {search || filter !== "all"
                ? t("services.noMatchingServices")
                : t("services.noServices")}
            </Text>
            <Text style={styles.emptySubtitle}>
              {search || filter !== "all"
                ? t("services.adjustSearch")
                : t("services.addFirstService")}
            </Text>
          </View>
        }
        ListFooterComponent={
          visibleCount < filteredServices.length ? (
            <ActivityIndicator
              style={styles.footerLoader}
              size="small"
              color="#2563EB"
            />
          ) : null
        }
      />

      {renderSheet()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 10,
    color: "#64748B",
    fontSize: 13,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 14,
    gap: 9,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  addButton: {
    height: 36,
    paddingHorizontal: 11,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  searchContainer: {
    flex: 1,
    minWidth: 0,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    fontSize: 13,
    color: "#0F172A",
  },
  compactControlButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  controlsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    marginBottom: 14,
  },
  controlButton: {
    flex: 1,
    minWidth: 0,
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  controlButtonActive: {
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
  },
  activeFilterDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563EB",
  },
  controlText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "600",
  },
  controlIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  controlIconActive: {
    backgroundColor: "#DBEAFE",
  },
  controlTextContainer: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  controlTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  controlSubtitle: {
    fontSize: 10,
    color: "#64748B",
  },
  controlSubtitleActive: {
    color: "#2563EB",
    fontWeight: "600",
  },
  controlValue: {
    flex: 1,
    minWidth: 0,
    color: "#0F172A",
    fontSize: 11,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E8EDF3",
    paddingHorizontal: 11,
    paddingVertical: 12,
    marginBottom: 9,
    gap: 10,
  },
  serviceIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
    gap: 7,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  serviceName: {
    flex: 1,
    minWidth: 0,
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "700",
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeBadge: {
    backgroundColor: "#DCFCE7",
  },
  inactiveBadge: {
    backgroundColor: "#F1F5F9",
  },
  statusText: {
    fontSize: 9,
    fontWeight: "700",
  },
  activeText: {
    color: "#15803D",
  },
  inactiveText: {
    color: "#64748B",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  metaContainer: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  category: {
    color: "#64748B",
    fontSize: 11,
    flexShrink: 1,
  },
  duration: {
    color: "#94A3B8",
    fontSize: 10,
    flexShrink: 1,
  },
  price: {
    color: "#16A34A",
    fontSize: 13,
    fontWeight: "700",
  },
  chevron: {
    marginLeft: -3,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 18,
  },
  footerLoader: {
    paddingVertical: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.38)",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: 3,
    backgroundColor: "#CBD5E1",
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  optionRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  optionText: {
    fontSize: 14,
    color: "#334155",
  },
  selectedOptionText: {
    color: "#2563EB",
    fontWeight: "700",
  },
  doneButton: {
    height: 44,
    borderRadius: 11,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  searchControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 12,
    marginBottom: 12,
  },
})
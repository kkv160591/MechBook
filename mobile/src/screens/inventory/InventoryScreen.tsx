import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from "react-native"

import { MaterialIcons, Ionicons } from "@expo/vector-icons"
import { useFocusEffect, useNavigation } from "@react-navigation/native"

import { getInventory } from "../../services/inventoryService"
import { useTranslation } from "../../context/LanguageContext"

interface InventoryPart {
  partId?: string
  inventoryId?: string
  name?: string
  sku?: string
  category?: string
  stock?: number
  minStock?: number
  sellingPrice?: number
  buyingPrice?: number
  createdAt?: string
  updatedAt?: string
}

type StockFilter = "all" | "inStock" | "lowStock"

type SortOption =
  | "recent"
  | "oldest"
  | "name"
  | "stockLow"
  | "stockHigh"
  | "priceHigh"

const PAGE_SIZE = 20

const getStock = (item: InventoryPart) =>
  Math.max(0, Number(item.stock ?? 0) || 0)

const getMinStock = (item: InventoryPart) =>
  Math.max(0, Number(item.minStock ?? 0) || 0)

const isLowStock = (item: InventoryPart) =>
  getStock(item) <= getMinStock(item)

const formatAmount = (value: unknown) => {
  const amount = Number(value ?? 0)

  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`
}

const getTimestamp = (item: InventoryPart) => {
  const timestamp = new Date(
    item.updatedAt || item.createdAt || 0
  ).getTime()

  return Number.isNaN(timestamp) ? 0 : timestamp
}

export default function InventoryScreen() {
  const navigation: any = useNavigation()
  const { t } = useTranslation()

  const [parts, setParts] = useState<InventoryPart[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<StockFilter>("all")
  const [sort, setSort] = useState<SortOption>("recent")

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterVisible, setFilterVisible] = useState(false)
  const [sortVisible, setSortVisible] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const loadInventory = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await getInventory()

      const inventoryList: InventoryPart[] = Array.isArray(response)
        ? response
        : Array.isArray(response?.parts)
          ? response.parts
          : []

      setParts(inventoryList)
    } catch (error: any) {
      console.log(
        "Inventory load error:",
        error?.response?.data || error?.message || error
      )

      Alert.alert(
        t("common.errorTitle") || "Error",
        error?.response?.data?.message ||
          t("common.somethingWentWrong") ||
          "Unable to load inventory. Please try again."
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [t])

  useFocusEffect(
    useCallback(() => {
      void loadInventory()
    }, [loadInventory])
  )

  const filteredAndSortedParts = useMemo(() => {
    let result = [...parts]
    const query = search.trim().toLowerCase()

    // Search by part name, SKU, category, or part ID.
    if (query) {
      result = result.filter((item) => {
        const searchableValues = [
          item.name,
          item.sku,
          item.category,
          item.partId,
          item.inventoryId,
        ]

        return searchableValues.some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        )
      })
    }

    // Filter by stock level.
    if (filter === "lowStock") {
      result = result.filter(isLowStock)
    } else if (filter === "inStock") {
      result = result.filter(
        (item) => getStock(item) > getMinStock(item)
      )
    }

    // Sort the filtered inventory.
    result.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return getTimestamp(a) - getTimestamp(b)

        case "name":
          return String(a.name || "").localeCompare(
            String(b.name || "")
          )

        case "stockLow":
          return getStock(a) - getStock(b)

        case "stockHigh":
          return getStock(b) - getStock(a)

        case "priceHigh":
          return (
            Number(b.sellingPrice ?? 0) -
            Number(a.sellingPrice ?? 0)
          )

        case "recent":
        default:
          return getTimestamp(b) - getTimestamp(a)
      }
    })

    return result
  }, [parts, search, filter, sort])

  // Reset pagination when the search, filter, or sort changes.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search, filter, sort])

  const visibleParts = useMemo(
    () => filteredAndSortedParts.slice(0, visibleCount),
    [filteredAndSortedParts, visibleCount]
  )

  const hasMore = visibleCount < filteredAndSortedParts.length

  const handleRefresh = useCallback(() => {
    void loadInventory(true)
  }, [loadInventory])

  const filterOptions: {
    key: StockFilter
    label: string
  }[] = [
    { key: "all", label: "All Parts" },
    { key: "inStock", label: "In Stock" },
    { key: "lowStock", label: "Low Stock" },
  ]

  const sortOptions: {
    key: SortOption
    label: string
  }[] = [
    { key: "recent", label: "Recently Updated" },
    { key: "oldest", label: "Oldest First" },
    { key: "name", label: "Part Name A–Z" },
    { key: "stockLow", label: "Lowest Stock First" },
    { key: "stockHigh", label: "Highest Stock First" },
    { key: "priceHigh", label: "Highest Selling Price" },
  ]

  const getFilterLabel = () => {
    const labels: Record<StockFilter, string> = {
      all: "All Parts",
      inStock: "In Stock",
      lowStock: "Low Stock",
    }

    return labels[filter]
  }

  const getSortLabel = () => {
    const labels: Record<SortOption, string> = {
      recent: "Recently Updated",
      oldest: "Oldest First",
      name: "Part Name A–Z",
      stockLow: "Lowest Stock",
      stockHigh: "Highest Stock",
      priceHigh: "Highest Price",
    }

    return labels[sort]
  }

  const renderPart = ({ item }: { item: InventoryPart }) => {
    const stock = getStock(item)
    const lowStock = isLowStock(item)

    const details = [
      item.category,
      item.sku ? `SKU: ${item.sku}` : null,
    ]
      .filter(Boolean)
      .join(" · ")

    return (
      <TouchableOpacity
        style={styles.partRow}
        activeOpacity={0.75}
        onPress={() =>
          navigation.navigate("PartDetails", { part: item })
        }
      >
        <View style={styles.partIcon}>
          <MaterialIcons
            name="inventory-2"
            size={18}
            color="#2563EB"
          />
        </View>

        <View style={styles.partMain}>
          {/* ROW 1: Part name + stock status */}
          <View style={styles.partTitleLine}>
            <Text style={styles.partName} numberOfLines={1}>
              {item.name || "Unnamed Part"}
            </Text>

            <View
              style={[
                styles.stockBadge,
                lowStock ? styles.lowStockBadge : styles.inStockBadge,
              ]}
            >
              <Text
                style={[
                  styles.stockText,
                  lowStock ? styles.lowStockText : styles.inStockText,
                ]}
                numberOfLines={1}
              >
                {lowStock ? "Low" : "In Stock"}: {stock}
              </Text>
            </View>
          </View>

          {/* ROW 2: Category/SKU + selling price */}
          <View style={styles.partBottomLine}>
            <Text style={styles.partDetails} numberOfLines={1}>
              {details || "No category"}
            </Text>

            <Text style={styles.partPrice} numberOfLines={1}>
              {formatAmount(item.sellingPrice)}
            </Text>
          </View>
        </View>

        <Ionicons
          name="chevron-forward"
          size={15}
          color="#94A3B8"
        />
      </TouchableOpacity>
    )
  }

  if (loading && parts.length === 0) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* HEADER — same structure as Jobs */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            {t("inventory.title") || "Inventory"}
          </Text>

          <Text style={styles.subtitle}>
            {filteredAndSortedParts.length}{" "}
            {filteredAndSortedParts.length === 1 ? "part" : "parts"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate("AddEditPart", { mode: "add" })
          }
        >
          <Ionicons name="add" size={23} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* SEARCH — same layout as Jobs */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#94A3B8" />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={
            t("inventory.searchPlaceholder") ||
            "Search name, SKU or category"
          }
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
          autoCapitalize="none"
          returnKeyType="search"
        />

        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearch("")}
            hitSlop={8}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color="#94A3B8"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* FILTER / SORT — same buttons as Jobs */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          activeOpacity={0.7}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons
            name="filter-outline"
            size={15}
            color="#475569"
          />

          <Text style={styles.controlText}>
            {getFilterLabel()}
          </Text>

          <Ionicons
            name="chevron-down"
            size={14}
            color="#64748B"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          activeOpacity={0.7}
          onPress={() => setSortVisible(true)}
        >
          <Ionicons
            name="swap-vertical-outline"
            size={15}
            color="#475569"
          />

          <Text style={styles.controlText}>
            {getSortLabel()}
          </Text>

          <Ionicons
            name="chevron-down"
            size={14}
            color="#64748B"
          />
        </TouchableOpacity>
      </View>

      {/* INVENTORY LIST */}
      <FlatList
        data={visibleParts}
        keyExtractor={(item, index) =>
          String(item.partId || item.inventoryId || index)
        }
        renderItem={renderPart}
        contentContainerStyle={[
          styles.list,
          visibleParts.length === 0 && styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#2563EB"]}
            tintColor="#2563EB"
          />
        }
        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons
              name="inventory-2"
              size={42}
              color="#CBD5E1"
            />

            <Text style={styles.emptyTitle}>
              {t("inventory.noPartsFound") || "No parts found"}
            </Text>

            <Text style={styles.emptyText}>
              Try changing your search or filter.
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMore ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              activeOpacity={0.7}
              onPress={() =>
                setVisibleCount((count) =>
                  Math.min(
                    count + PAGE_SIZE,
                    filteredAndSortedParts.length
                  )
                )
              }
            >
              <Text style={styles.loadMoreText}>
                Load More ({filteredAndSortedParts.length - visibleCount} remaining)
              </Text>

              <Ionicons
                name="chevron-down"
                size={15}
                color="#2563EB"
              />
            </TouchableOpacity>
          ) : null
        }
      />

      {/* FILTER MODAL — same bottom sheet as Jobs */}
      <Modal
        visible={filterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.bottomOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                Filter Inventory
              </Text>

              <TouchableOpacity
                onPress={() => setFilterVisible(false)}
                hitSlop={8}
              >
                <Ionicons
                  name="close"
                  size={23}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={styles.option}
                activeOpacity={0.7}
                onPress={() => {
                  setFilter(option.key)
                  setFilterVisible(false)
                }}
              >
                <Text style={styles.optionText}>
                  {option.label}
                </Text>

                {filter === option.key && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#2563EB"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* SORT MODAL — same bottom sheet as Jobs */}
      <Modal
        visible={sortVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSortVisible(false)}
      >
        <View style={styles.bottomOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                Sort Inventory
              </Text>

              <TouchableOpacity
                onPress={() => setSortVisible(false)}
                hitSlop={8}
              >
                <Ionicons
                  name="close"
                  size={23}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={styles.option}
                activeOpacity={0.7}
                onPress={() => {
                  setSort(option.key)
                  setSortVisible(false)
                }}
              >
                <Text style={styles.optionText}>
                  {option.label}
                </Text>

                {sort === option.key && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#2563EB"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 10,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 11,
    color: "#64748B",
  },

  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  searchBox: {
    height: 42,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    marginLeft: 7,
    fontSize: 12,
    color: "#111827",
    paddingVertical: 0,
  },

  controls: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 9,
  },

  controlButton: {
    minHeight: 34,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  controlText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },

  list: {
    paddingTop: 2,
    paddingBottom: 12,
  },

  emptyList: {
    flexGrow: 1,
  },

  partRow: {
    minHeight: 66,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 9,
    borderRadius: 11,
    gap: 8,
  },

  partIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  partMain: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },

  partTitleLine: {
    minHeight: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },

  partName: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
  },

  stockBadge: {
    flexShrink: 0,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },

  lowStockBadge: {
    backgroundColor: "#FEF2F2",
  },

  inStockBadge: {
    backgroundColor: "#ECFDF5",
  },

  stockText: {
    fontSize: 9,
    fontWeight: "800",
  },

  lowStockText: {
    color: "#DC2626",
  },

  inStockText: {
    color: "#15803D",
  },

  partDetailsLine: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  partBottomLine: {
    minHeight: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 4,
  },

  partDetails: {
    flex: 1,
    minWidth: 0,
    fontSize: 10,
    color: "#64748B",
  },

  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    maxWidth: 105,
  },

  partPrice: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
    marginLeft: 4,
  },

  separator: {
    height: 4,
  },

  empty: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 80,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginTop: 10,
  },

  emptyText: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 5,
    textAlign: "center",
  },

  loadMoreButton: {
    minHeight: 43,
    marginTop: 12,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  loadMoreText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "700",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },

  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 30,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  sheetTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },

  option: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  optionText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
  },
})
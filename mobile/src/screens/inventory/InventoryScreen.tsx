
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  Pressable,
} from "react-native";

import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { getInventory } from "../../services/inventoryService";
import { useTranslation } from "../../context/LanguageContext";

interface InventoryPart {
  partId?: string;
  inventoryId?: string;
  name?: string;
  sku?: string;
  category?: string;
  stock?: number;
  minStock?: number;
  sellingPrice?: number;
  buyingPrice?: number;
  createdAt?: string;
  updatedAt?: string;
}

type StockFilter = "all" | "inStock" | "lowStock";

type SortOption =
  | "recent"
  | "oldest"
  | "name"
  | "stockLow"
  | "stockHigh"
  | "priceHigh";

const PAGE_SIZE = 20;

const getStock = (item: InventoryPart) =>
  Math.max(0, Number(item.stock ?? 0) || 0);

const getMinStock = (item: InventoryPart) =>
  Math.max(0, Number(item.minStock ?? 0) || 0);

const isLowStock = (item: InventoryPart) =>
  getStock(item) <= getMinStock(item);

const formatAmount = (value: unknown) => {
  const amount = Number(value ?? 0);

  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const getTimestamp = (item: InventoryPart) => {
  const timestamp = new Date(
    item.updatedAt || item.createdAt || 0
  ).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export default function InventoryScreen() {
  const navigation: any = useNavigation();
  const { t } = useTranslation();

  const [parts, setParts] = useState<InventoryPart[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StockFilter>("all");
  const [sort, setSort] = useState<SortOption>("recent");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const loadInventory = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await getInventory();

        const inventoryList: InventoryPart[] = Array.isArray(response)
          ? response
          : Array.isArray(response?.parts)
            ? response.parts
            : [];

        setParts(inventoryList);
      } catch (error: any) {
        console.log(
          "Inventory load error:",
          error?.response?.data || error?.message || error
        );

        Alert.alert(
          t("common.errorTitle"),
          error?.response?.data?.message ||
            t("inventory.loadError")
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [t]
  );

  useFocusEffect(
    useCallback(() => {
      void loadInventory();
    }, [loadInventory])
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, filter, sort]);

  const filteredAndSortedParts = useMemo(() => {
    let result = [...parts];
    const query = search.trim().toLowerCase();

    // Search by name, SKU, category, or part ID.
    if (query) {
      result = result.filter((item) => {
        const searchableValues = [
          item.name,
          item.sku,
          item.category,
          item.partId,
          item.inventoryId,
        ];

        return searchableValues.some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );
      });
    }

    // Filter by stock level.
    if (filter === "lowStock") {
      result = result.filter(isLowStock);
    } else if (filter === "inStock") {
      result = result.filter(
        (item) => getStock(item) > getMinStock(item)
      );
    }

    // Sort the filtered inventory.
    result.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return getTimestamp(a) - getTimestamp(b);

        case "name":
          return String(a.name || "").localeCompare(
            String(b.name || "")
          );

        case "stockLow":
          return getStock(a) - getStock(b);

        case "stockHigh":
          return getStock(b) - getStock(a);

        case "priceHigh":
          return (
            Number(b.sellingPrice ?? 0) -
            Number(a.sellingPrice ?? 0)
          );

        case "recent":
        default:
          return getTimestamp(b) - getTimestamp(a);
      }
    });

    return result;
  }, [parts, search, filter, sort]);

  const visibleParts = useMemo(
    () => filteredAndSortedParts.slice(0, visibleCount),
    [filteredAndSortedParts, visibleCount]
  );

  const hasMore = visibleCount < filteredAndSortedParts.length;

  const handleRefresh = useCallback(() => {
    void loadInventory(true);
  }, [loadInventory]);

  const filterOptions: { key: StockFilter; label: string }[] = [
    { key: "all", label: t("inventory.allParts") },
    { key: "inStock", label: t("inventory.inStock") },
    { key: "lowStock", label: t("inventory.lowStock") },
  ];

  const sortOptions: { key: SortOption; label: string }[] = [
    { key: "recent", label: t("inventory.recentlyUpdated") },
    { key: "oldest", label: t("common.oldestFirst") },
    { key: "name", label: t("inventory.partNameAZ") },
    { key: "stockLow", label: t("inventory.lowestStockFirst") },
    { key: "stockHigh", label: t("inventory.highestStockFirst") },
    { key: "priceHigh", label: t("inventory.highestSellingPrice") },
  ];

  const getFilterLabel = () => {
    switch (filter) {
      case "inStock":
        return t("inventory.inStock");
      case "lowStock":
        return t("inventory.lowStock");
      default:
        return t("inventory.allParts");
    }
  };

  const getSortLabel = () => {
    switch (sort) {
      case "oldest":
        return t("common.oldestFirst");
      case "name":
        return t("inventory.partNameAZ");
      case "stockLow":
        return t("inventory.lowestStock");
      case "stockHigh":
        return t("inventory.highestStock");
      case "priceHigh":
        return t("inventory.highestPrice");
      default:
        return t("inventory.recentlyUpdated");
    }
  };

  const renderOption = (
    label: string,
    selected: boolean,
    onPress: () => void
  ) => (
    <TouchableOpacity
      key={label}
      style={styles.option}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Text
        style={[
          styles.optionText,
          selected && styles.selectedOptionText,
        ]}
      >
        {label}
      </Text>

      {selected && (
        <Ionicons
          name="checkmark-circle"
          size={20}
          color="#2563EB"
        />
      )}
    </TouchableOpacity>
  );

  const renderPart = ({ item }: { item: InventoryPart }) => {
    const stock = getStock(item);
    const lowStock = isLowStock(item);

    const details = [
      item.category,
      item.sku ? `SKU: ${item.sku}` : null,
    ]
      .filter(Boolean)
      .join(" · ");

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
          <View style={styles.partTitleLine}>
            <Text style={styles.partName} numberOfLines={1}>
              {item.name || t("inventory.unnamedPart")}
            </Text>

            <View
              style={[
                styles.stockBadge,
                lowStock
                  ? styles.lowStockBadge
                  : styles.inStockBadge,
              ]}
            >
              <Text
                style={[
                  styles.stockText,
                  lowStock
                    ? styles.lowStockText
                    : styles.inStockText,
                ]}
                numberOfLines={1}
              >
                {lowStock
                  ? t("inventory.low")
                  : t("inventory.inStock")}
                : {stock}
              </Text>
            </View>
          </View>

          <View style={styles.partBottomLine}>
            <Text style={styles.partDetails} numberOfLines={1}>
              {details || t("inventory.noCategory")}
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
    );
  };

  if (loading && parts.length === 0) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>
          {t("inventory.loading")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            {t("inventory.title")}
          </Text>

          <Text style={styles.subtitle}>
            {filteredAndSortedParts.length}{" "}
            {t("inventory.partsCount")}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate("AddEditPart", { mode: "add" })
          }
          accessibilityRole="button"
          accessibilityLabel={t("inventory.addPart")}
        >
          <Ionicons name="add" size={23} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search + Filter + Sort in one row */}
      <View style={styles.searchControlsRow}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={18}
            color="#94A3B8"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t("inventory.searchPlaceholder")}
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            autoCapitalize="none"
            returnKeyType="search"
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t("common.clearSearch")}
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
            filter !== "all" && styles.activeControlButton,
          ]}
          activeOpacity={0.7}
          onPress={() => setFilterVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={`${t("common.filter")}: ${getFilterLabel()}`}
        >
          <Ionicons
            name="filter-outline"
            size={17}
            color={filter !== "all" ? "#2563EB" : "#475569"}
          />

          {filter !== "all" && (
            <View style={styles.activeControlDot} />
          )}
        </TouchableOpacity>

        {/* Sort */}
        <TouchableOpacity
          style={[
            styles.compactControlButton,
            sort !== "recent" && styles.activeControlButton,
          ]}
          activeOpacity={0.7}
          onPress={() => setSortVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={`${t("common.sort")}: ${getSortLabel()}`}
        >
          <Ionicons
            name="swap-vertical-outline"
            size={18}
            color={sort !== "recent" ? "#2563EB" : "#475569"}
          />

          {sort !== "recent" && (
            <View style={styles.activeControlDot} />
          )}
        </TouchableOpacity>
      </View>

      {/* Inventory list */}
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
        onEndReached={() => {
          if (hasMore) {
            setVisibleCount((count) =>
              Math.min(
                count + PAGE_SIZE,
                filteredAndSortedParts.length
              )
            );
          }
        }}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons
              name="inventory-2"
              size={42}
              color="#CBD5E1"
            />

            <Text style={styles.emptyTitle}>
              {search.trim() || filter !== "all"
                ? t("inventory.noMatchingParts")
                : t("inventory.noPartsFound")}
            </Text>

            <Text style={styles.emptyText}>
              {search.trim() || filter !== "all"
                ? t("inventory.adjustSearch")
                : t("inventory.addFirstPart")}
            </Text>

            {(search.trim() || filter !== "all") && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSearch("");
                  setFilter("all");
                }}
              >
                <Text style={styles.clearFiltersText}>
                  {t("inventory.clearSearchFilters")}
                </Text>
              </TouchableOpacity>
            )}
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
                {t("common.loadMore")} (
                {filteredAndSortedParts.length - visibleCount})
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

      {/* Filter bottom sheet */}
      <Modal
        visible={filterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
      >
        <Pressable
          style={styles.bottomOverlay}
          onPress={() => setFilterVisible(false)}
        >
          <Pressable
            style={styles.bottomSheet}
            onPress={() => {}}
          >
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {t("inventory.filterInventory")}
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

            {filterOptions.map((option) =>
              renderOption(
                option.label,
                filter === option.key,
                () => {
                  setFilter(option.key);
                  setFilterVisible(false);
                }
              )
            )}

            <TouchableOpacity
              style={styles.sheetCloseButton}
              onPress={() => setFilterVisible(false)}
            >
              <Text style={styles.sheetCloseText}>
                {t("common.done")}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Sort bottom sheet */}
      <Modal
        visible={sortVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSortVisible(false)}
      >
        <Pressable
          style={styles.bottomOverlay}
          onPress={() => setSortVisible(false)}
        >
          <Pressable
            style={styles.bottomSheet}
            onPress={() => {}}
          >
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {t("inventory.sortInventory")}
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

            {sortOptions.map((option) =>
              renderOption(
                option.label,
                sort === option.key,
                () => {
                  setSort(option.key);
                  setSortVisible(false);
                }
              )
            )}

            <TouchableOpacity
              style={styles.sheetCloseButton}
              onPress={() => setSortVisible(false)}
            >
              <Text style={styles.sheetCloseText}>
                {t("common.done")}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 10,
    gap: 8,
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

  /* Search + compact controls */
  searchControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    minWidth: 0,
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 7,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    color: "#111827",
    paddingVertical: 0,
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
  activeControlButton: {
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
  },
  activeControlDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563EB",
  },

  /* Inventory cards */
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
  partPrice: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
    marginLeft: 4,
  },
  separator: {
    height: 8,
  },

  /* Loading and empty states */
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 10,
    color: "#64748B",
    fontSize: 12,
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
    textAlign: "center",
  },
  emptyText: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 5,
    textAlign: "center",
  },
  clearFiltersButton: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
  },
  clearFiltersText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "700",
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

  /* Bottom sheets */
  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 26,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sheetTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  option: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
  },
  optionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  selectedOptionText: {
    color: "#2563EB",
    fontWeight: "800",
  },
  sheetCloseButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 14,
  },
  sheetCloseText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
  },
});

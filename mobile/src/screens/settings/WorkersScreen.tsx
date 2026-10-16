
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Pressable,
} from "react-native";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import { useState, useCallback, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getWorkers } from "../../services/workerService";
import { useTranslation } from "../../context/LanguageContext";

interface Worker {
  workerId: string;
  garageId: string;
  name: string;
  role: string;
  phone: string;
  active: boolean;
  createdAt: string;
  userId?: string;
}

type WorkerFilter = "all" | "active" | "inactive";
type WorkerSort = "newest" | "oldest" | "name" | "role";

const PAGE_SIZE = 20;

export default function WorkersScreen({ navigation }: any) {
  const { t } = useTranslation();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<WorkerFilter>("all");
  const [sort, setSort] = useState<WorkerSort>("newest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const loadWorkers = useCallback(async () => {
    try {
      const response = await getWorkers();

      if (response?.success && Array.isArray(response.workers)) {
        setWorkers(response.workers);
      } else if (Array.isArray(response)) {
        setWorkers(response);
      } else {
        setWorkers([]);
      }

      setVisibleCount(PAGE_SIZE);
    } catch (error) {
      console.error("Failed to load workers:", error);

      Alert.alert(
        t("common.errorTitle"),
        t("workers.addError")
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      loadWorkers();
    }, [loadWorkers])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadWorkers();
  }, [loadWorkers]);

  const filteredWorkers = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = workers.filter((worker) => {
      const matchesSearch =
        !query ||
        (worker.name || "").toLowerCase().includes(query) ||
        (worker.role || "").toLowerCase().includes(query) ||
        (worker.phone || "").toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && worker.active === true) ||
        (filter === "inactive" && worker.active === false);

      return matchesSearch && matchesFilter;
    });

    result.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return (
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
          );

        case "name":
          return (a.name || "").localeCompare(b.name || "");

        case "role":
          return (a.role || "").localeCompare(b.role || "");

        case "newest":
        default:
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
      }
    });

    return result;
  }, [workers, search, filter, sort]);

  const visibleWorkers = filteredWorkers.slice(0, visibleCount);

  const renderWorkerCard = ({ item }: { item: Worker }) => {
    const workerId =
      item.workerId || (item as any)._id || (item as any).id;

    return (
      <TouchableOpacity
        style={styles.workerCard}
        activeOpacity={0.75}
        onPress={() => {
          if (workerId) {
            navigation.navigate("WorkerDetails", { workerId });
          } else {
            console.warn(
              "Worker item is missing a valid identifier:",
              item
            );
          }
        }}
      >
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={19} color="#2563EB" />
        </View>

        <View style={styles.workerMain}>
          <View style={styles.workerTopLine}>
            <Text style={styles.workerName} numberOfLines={1}>
              {item.name || t("workers.unnamedWorker")}
            </Text>

            <View
              style={[
                styles.statusBadge,
                item.active
                  ? styles.activeBadge
                  : styles.inactiveBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  item.active
                    ? styles.activeText
                    : styles.inactiveText,
                ]}
                numberOfLines={1}
              >
                {item.active
                  ? t("common.active").toUpperCase()
                  : t("common.inactive").toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.workerBottomLine}>
            <Text style={styles.workerRole} numberOfLines={1}>
              {item.role || t("workers.noRole")}
            </Text>

            <Text style={styles.workerPhone} numberOfLines={1}>
              {item.phone || t("workers.noPhone")}
            </Text>
          </View>
        </View>

        <MaterialIcons
          name="chevron-right"
          size={19}
          color="#94A3B8"
        />
      </TouchableOpacity>
    );
  };

  const renderOption = (
    label: string,
    selected: boolean,
    onPress: () => void
  ) => (
    <Pressable
      key={label}
      style={styles.optionRow}
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
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
          >
            <Feather
              name="arrow-left"
              size={20}
              color="#111827"
            />
          </TouchableOpacity>

          <View style={styles.headerTextGroup}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {t("workers.title")}
            </Text>

            <Text style={styles.headerSubtitle}>
              {filteredWorkers.length} {t("workers.count")}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("AddWorker")}
        >
          <MaterialIcons
            name="add"
            size={19}
            color="#FFFFFF"
          />
          <Text style={styles.addBtnText}>
            {t("workers.addWorker")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search + Filter + Sort in one row */}
      <View style={styles.searchControlsRow}>
        <View style={styles.searchBox}>
          <Feather
            name="search"
            size={17}
            color="#94A3B8"
          />

          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={(value) => {
              setSearch(value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder={t("workers.searchPlaceholder")}
            placeholderTextColor="#94A3B8"
            returnKeyType="search"
            autoCapitalize="none"
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearch("");
                setVisibleCount(PAGE_SIZE);
              }}
              activeOpacity={0.7}
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

        {/* Filter icon */}
        <TouchableOpacity
          style={[
            styles.compactControlButton,
            filter !== "all" && styles.activeControlButton,
          ]}
          onPress={() => setFilterModalVisible(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={
            `${t("common.filter")}: ${
              filter === "all"
                ? t("workers.allWorkers")
                : filter === "active"
                  ? t("common.active")
                  : t("common.inactive")
            }`
          }
        >
          <Feather
            name="filter"
            size={17}
            color={filter !== "all" ? "#2563EB" : "#475569"}
          />

          {filter !== "all" && (
            <View style={styles.activeFilterDot} />
          )}
        </TouchableOpacity>

        {/* Sort icon */}
        <TouchableOpacity
          style={[
            styles.compactControlButton,
            sort !== "newest" && styles.activeControlButton,
          ]}
          onPress={() => setSortModalVisible(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t("common.sort")}
        >
          <MaterialIcons
            name="sort"
            size={19}
            color={sort !== "newest" ? "#2563EB" : "#475569"}
          />

          {sort !== "newest" && (
            <View style={styles.activeFilterDot} />
          )}
        </TouchableOpacity>
      </View>

      {/* Worker list */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>
            {t("workers.loading")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={visibleWorkers}
          keyExtractor={(item, index) =>
            item.workerId ||
            (item as any)._id ||
            (item as any).id ||
            index.toString()
          }
          renderItem={renderWorkerCard}
          contentContainerStyle={[
            styles.listContent,
            visibleWorkers.length === 0 &&
              styles.emptyListContent,
          ]}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onEndReached={() => {
            if (visibleCount < filteredWorkers.length) {
              setVisibleCount((count) =>
                Math.min(
                  count + PAGE_SIZE,
                  filteredWorkers.length
                )
              );
            }
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            visibleCount < filteredWorkers.length ? (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={() =>
                  setVisibleCount((count) =>
                    Math.min(
                      count + PAGE_SIZE,
                      filteredWorkers.length
                    )
                  )
                }
              >
                <Text style={styles.loadMoreText}>
                  {t("common.loadMore")}
                </Text>
              </TouchableOpacity>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name="people-outline"
                size={48}
                color="#9CA3AF"
              />

              <Text style={styles.emptyText}>
                {search.trim() || filter !== "all"
                  ? t("workers.noMatchingWorkers")
                  : t("workers.noWorkers")}
              </Text>

              {(search.trim() || filter !== "all") && (
                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={() => {
                    setSearch("");
                    setFilter("all");
                    setVisibleCount(PAGE_SIZE);
                  }}
                >
                  <Text style={styles.clearFiltersText}>
                    {t("workers.clearSearchFilters")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* Filter bottom sheet */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setFilterModalVisible(false)}
        >
          <Pressable
            style={styles.bottomSheet}
            onPress={() => {}}
          >
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>
              {t("workers.filterWorkers")}
            </Text>

            {renderOption(
              t("workers.allWorkers"),
              filter === "all",
              () => {
                setFilter("all");
                setVisibleCount(PAGE_SIZE);
                setFilterModalVisible(false);
              }
            )}

            {renderOption(
              t("common.active"),
              filter === "active",
              () => {
                setFilter("active");
                setVisibleCount(PAGE_SIZE);
                setFilterModalVisible(false);
              }
            )}

            {renderOption(
              t("common.inactive"),
              filter === "inactive",
              () => {
                setFilter("inactive");
                setVisibleCount(PAGE_SIZE);
                setFilterModalVisible(false);
              }
            )}

            <TouchableOpacity
              style={styles.sheetCloseButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.sheetCloseText}>
                {t("common.close")}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Sort bottom sheet */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSortModalVisible(false)}
        >
          <Pressable
            style={styles.bottomSheet}
            onPress={() => {}}
          >
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>
              {t("workers.sortWorkers")}
            </Text>

            {renderOption(
              t("common.recentlyAdded"),
              sort === "newest",
              () => {
                setSort("newest");
                setVisibleCount(PAGE_SIZE);
                setSortModalVisible(false);
              }
            )}

            {renderOption(
              t("common.oldestFirst"),
              sort === "oldest",
              () => {
                setSort("oldest");
                setVisibleCount(PAGE_SIZE);
                setSortModalVisible(false);
              }
            )}

            {renderOption(
              t("common.nameAZ"),
              sort === "name",
              () => {
                setSort("name");
                setVisibleCount(PAGE_SIZE);
                setSortModalVisible(false);
              }
            )}

            {renderOption(
              t("workers.roleAZ"),
              sort === "role",
              () => {
                setSort("role");
                setVisibleCount(PAGE_SIZE);
                setSortModalVisible(false);
              }
            )}

            <TouchableOpacity
              style={styles.sheetCloseButton}
              onPress={() => setSortModalVisible(false)}
            >
              <Text style={styles.sheetCloseText}>
                {t("common.close")}
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
    paddingTop: 12,
  },

  /* Header */
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  headerLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  headerTextGroup: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 9,
  },
  addBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginLeft: 3,
    fontSize: 11,
  },

  /* Compact search + Filter + Sort row */
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
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    color: "#0F172A",
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
  activeFilterDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563EB",
  },

  /* Worker cards */
  listContent: {
    paddingBottom: 24,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  workerCard: {
    minHeight: 66,
    backgroundColor: "#FFFFFF",
    borderRadius: 11,
    paddingHorizontal: 9,
    paddingVertical: 9,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatarContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  workerMain: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  workerTopLine: {
    minHeight: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  workerName: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
  },
  statusBadge: {
    flexShrink: 0,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeBadge: {
    backgroundColor: "#ECFDF5",
  },
  inactiveBadge: {
    backgroundColor: "#FEF2F2",
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },
  activeText: {
    color: "#15803D",
  },
  inactiveText: {
    color: "#DC2626",
  },
  workerBottomLine: {
    minHeight: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 4,
  },
  workerRole: {
    flex: 1,
    minWidth: 0,
    fontSize: 10,
    color: "#64748B",
  },
  workerPhone: {
    flexShrink: 0,
    maxWidth: "48%",
    fontSize: 10,
    color: "#64748B",
    textAlign: "right",
  },

  /* Loading and empty states */
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#64748B",
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
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
    alignSelf: "center",
    marginVertical: 12,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: "#EFF6FF",
  },
  loadMoreText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "700",
  },

  /* Bottom sheets */
  modalOverlay: {
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
  sheetTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  optionRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
  },
  optionText: {
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

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
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  ActivityIndicator,
  Pressable,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { getJobs } from "../../services/jobService";
import JobCard from "../../components/JobCard";
import { useTranslation } from "../../context/LanguageContext";

type JobFilter =
  | "all"
  | "pending"
  | "progress"
  | "waiting_parts"
  | "ready"
  | "completed"
  | "delivered"
  | "overdue";

type JobSort =
  | "newest"
  | "oldest"
  | "customerAsc"
  | "deliveryDate"
  | "highestAmount";

const PAGE_SIZE = 20;

const normalizeStatus = (status: string = "") => {
  const value = status.toLowerCase().trim().replace(/[\s-]+/g, "_");
  if (value === "in_progress" || value === "inprogress") return "progress";
  return value;
};

const isJobOverdue = (job: any) => {
  if (!job.deliveryDate) return false;
  const status = normalizeStatus(job.status);
  if (status === "completed" || status === "delivered") return false;

  const deliveryDate = new Date(job.deliveryDate);
  if (Number.isNaN(deliveryDate.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deliveryDate.setHours(0, 0, 0, 0);
  return deliveryDate < today;
};

export default function JobsScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<JobFilter>("all");
  const [sort, setSort] = useState<JobSort>("newest");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const loadJobs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const response = await getJobs();
      const list = Array.isArray(response?.jobs)
        ? response.jobs
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setJobs(list);
    } catch (error: any) {
      console.log("Jobs load error:", error?.response?.data || error?.message || error);
      Alert.alert(t("jobs.errorTitle"), t("jobs.unableToLoadJobs"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void loadJobs();
    }, [loadJobs])
  );

  const displayedJobs = useMemo(() => {
    let result = [...jobs];
    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((job) =>
        [
          job.customerName,
          job.phone,
          job.vehicleNumber,
          job.jobId,
          job.jobNumber,
          job.vehicleBrand,
          job.vehicleModel,
        ].some((value) => String(value ?? "").toLowerCase().includes(query))
      );
    }

    if (filter === "overdue") {
      result = result.filter(isJobOverdue);
    } else if (filter !== "all") {
      result = result.filter((job) => normalizeStatus(job.status) === filter);
    }

    result.sort((a, b) => {
      const aCreated = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const bCreated = new Date(b.createdAt || b.updatedAt || 0).getTime();
      switch (sort) {
        case "oldest":
          return aCreated - bCreated;
        case "customerAsc":
          return String(a.customerName || "").localeCompare(String(b.customerName || ""));
        case "deliveryDate": {
          const aDate = a.deliveryDate ? new Date(a.deliveryDate).getTime() : Number.MAX_SAFE_INTEGER;
          const bDate = b.deliveryDate ? new Date(b.deliveryDate).getTime() : Number.MAX_SAFE_INTEGER;
          return aDate - bDate;
        }
        case "highestAmount":
          return Number(b.totalAmount || 0) - Number(a.totalAmount || 0);
        case "newest":
        default:
          return bCreated - aCreated;
      }
    });
    return result;
  }, [jobs, search, filter, sort]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, filter, sort]);

  const visibleJobs = useMemo(
    () => displayedJobs.slice(0, visibleCount),
    [displayedJobs, visibleCount]
  );

  const handleRefresh = useCallback(() => {
    void loadJobs(true);
  }, [loadJobs]);

  const filterOptions: { key: JobFilter; label: string }[] = [
    { key: "all", label: t("jobs.all") },
    { key: "pending", label: t("jobs.pending") },
    { key: "progress", label: t("jobs.inProgress") },
    { key: "waiting_parts", label: t("jobs.waitingParts") },
    { key: "ready", label: t("jobs.ready") },
    { key: "completed", label: t("jobs.completed") },
    { key: "delivered", label: t("jobs.delivered") },
    { key: "overdue", label: t("jobs.overdue") },
  ];

  const sortOptions: { key: JobSort; label: string }[] = [
    { key: "newest", label: t("jobs.newestFirst") },
    { key: "oldest", label: t("jobs.oldestFirst") },
    { key: "customerAsc", label: t("jobs.customerNameAZ") },
    { key: "deliveryDate", label: t("jobs.earliestDeliveryDate") },
    { key: "highestAmount", label: t("jobs.highestJobAmount") },
  ];

  const selectedFilterLabel = filterOptions.find((item) => item.key === filter)?.label || t("jobs.all");
  const selectedSortLabel = sortOptions.find((item) => item.key === sort)?.label || t("jobs.newestFirst");

  const renderOption = (label: string, selected: boolean, onPress: () => void) => (
    <TouchableOpacity key={label} style={styles.option} activeOpacity={0.7} onPress={onPress}>
      <Text style={[styles.optionText, selected && styles.selectedOptionText]}>{label}</Text>
      {selected && <Ionicons name="checkmark-circle" size={20} color="#2563EB" />}
    </TouchableOpacity>
  );

  if (loading && jobs.length === 0) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>{t("jobs.pleaseWait")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header matches Inventory: no back button and icon-only add action. */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t("jobs.title")}</Text>
          <Text style={styles.subtitle}>
            {displayedJobs.length} {displayedJobs.length === 1 ? t("jobs.jobSingular") : t("jobs.jobPlural")}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("CreateJob")}
          accessibilityRole="button"
          accessibilityLabel={t("jobs.createJob")}
        >
          <Ionicons name="add" size={23} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search, Filter and Sort share one compact row, like Inventory. */}
      <View style={styles.searchControlsRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t("jobs.searchPlaceholder")}
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
              accessibilityLabel={t("jobs.clearSearch")}
            >
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.compactControlButton, filter !== "all" && styles.activeControlButton]}
          activeOpacity={0.7}
          onPress={() => setFilterVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={`${t("jobs.filterLabel")}: ${selectedFilterLabel}`}
        >
          <Ionicons name="filter-outline" size={17} color={filter !== "all" ? "#2563EB" : "#475569"} />
          {filter !== "all" && <View style={styles.activeControlDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.compactControlButton, sort !== "newest" && styles.activeControlButton]}
          activeOpacity={0.7}
          onPress={() => setSortVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={`${t("jobs.sortLabel")}: ${selectedSortLabel}`}
        >
          <Ionicons name="swap-vertical-outline" size={18} color={sort !== "newest" ? "#2563EB" : "#475569"} />
          {sort !== "newest" && <View style={styles.activeControlDot} />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={visibleJobs}
        keyExtractor={(item, index) => String(item.jobId || item.jobNumber || index)}
        renderItem={({ item }) => <JobCard job={item} />}
        contentContainerStyle={[styles.list, visibleJobs.length === 0 && styles.emptyList]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#2563EB"]} tintColor="#2563EB" />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onEndReached={() => {
          if (visibleCount < displayedJobs.length) {
            setVisibleCount((count) => Math.min(count + PAGE_SIZE, displayedJobs.length));
          }
        }}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="clipboard-outline" size={42} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>{t("jobs.noMatchingJobs")}</Text>
            <Text style={styles.emptyText}>{t("jobs.tryChangingSearchOrFilter")}</Text>
            {(search.trim() || filter !== "all") && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => { setSearch(""); setFilter("all"); }}
              >
                <Text style={styles.clearFiltersText}>{t("jobs.clearSearchAndFilters")}</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListFooterComponent={
          visibleCount < displayedJobs.length ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              activeOpacity={0.7}
              onPress={() => setVisibleCount((count) => Math.min(count + PAGE_SIZE, displayedJobs.length))}
            >
              <Text style={styles.loadMoreText}>{t("jobs.loadMore")} ({displayedJobs.length - visibleCount})</Text>
              <Ionicons name="chevron-down" size={15} color="#2563EB" />
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Filter bottom sheet */}
      <Modal visible={filterVisible} transparent animationType="slide" onRequestClose={() => setFilterVisible(false)}>
        <Pressable style={styles.bottomOverlay} onPress={() => setFilterVisible(false)}>
          <Pressable style={styles.bottomSheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t("jobs.filterJobs")}</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={23} color="#64748B" />
              </TouchableOpacity>
            </View>
            {filterOptions.map((option) => renderOption(option.label, filter === option.key, () => {
              setFilter(option.key);
              setFilterVisible(false);
            }))}
            <TouchableOpacity style={styles.sheetCloseButton} onPress={() => setFilterVisible(false)}>
              <Text style={styles.sheetCloseText}>{t("jobs.done")}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Sort bottom sheet */}
      <Modal visible={sortVisible} transparent animationType="slide" onRequestClose={() => setSortVisible(false)}>
        <Pressable style={styles.bottomOverlay} onPress={() => setSortVisible(false)}>
          <Pressable style={styles.bottomSheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t("jobs.sortJobs")}</Text>
              <TouchableOpacity onPress={() => setSortVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={23} color="#64748B" />
              </TouchableOpacity>
            </View>
            {sortOptions.map((option) => renderOption(option.label, sort === option.key, () => {
              setSort(option.key);
              setSortVisible(false);
            }))}
            <TouchableOpacity style={styles.sheetCloseButton} onPress={() => setSortVisible(false)}>
              <Text style={styles.sheetCloseText}>{t("jobs.done")}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", paddingHorizontal: 12 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 12, paddingBottom: 10, gap: 8,
  },
  headerText: { flex: 1, minWidth: 0 },
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtitle: { marginTop: 2, fontSize: 11, color: "#64748B" },
  addButton: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: "#2563EB",
    alignItems: "center", justifyContent: "center",
  },
  searchControlsRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 12 },
  searchBox: {
    flex: 1, minWidth: 0, height: 40, backgroundColor: "#FFFFFF", borderRadius: 10,
    borderWidth: 1, borderColor: "#E2E8F0", flexDirection: "row", alignItems: "center",
    paddingHorizontal: 10, gap: 7,
  },
  searchInput: { flex: 1, minWidth: 0, fontSize: 12, color: "#111827", paddingVertical: 0 },
  compactControlButton: {
    width: 40, height: 40, borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", position: "relative",
  },
  activeControlButton: { borderColor: "#BFDBFE", backgroundColor: "#EFF6FF" },
  activeControlDot: {
    position: "absolute", top: 7, right: 7, width: 6, height: 6,
    borderRadius: 3, backgroundColor: "#2563EB",
  },
  list: { paddingTop: 2, paddingBottom: 12 },
  emptyList: { flexGrow: 1 },
  separator: { height: 8 },
  empty: { alignItems: "center", paddingTop: 40, paddingBottom: 80, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#334155", marginTop: 10, textAlign: "center" },
  emptyText: { fontSize: 11, color: "#94A3B8", marginTop: 5, textAlign: "center" },
  clearFiltersButton: { marginTop: 12, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: "#EFF6FF" },
  clearFiltersText: { color: "#2563EB", fontSize: 12, fontWeight: "700" },
  loadMoreButton: {
    minHeight: 43, marginTop: 12, marginBottom: 10, backgroundColor: "#FFFFFF",
    borderWidth: 1, borderColor: "#DBEAFE", borderRadius: 10, alignItems: "center",
    justifyContent: "center", flexDirection: "row", gap: 7,
  },
  loadMoreText: { color: "#2563EB", fontSize: 12, fontWeight: "700" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  loadingText: { marginTop: 10, color: "#64748B", fontSize: 12 },
  bottomOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.35)", justifyContent: "flex-end" },
  bottomSheet: {
    backgroundColor: "#FFFFFF", borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 18, paddingTop: 10, paddingBottom: 26,
  },
  sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: "#CBD5E1", alignSelf: "center", marginBottom: 16 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  sheetTitle: { flex: 1, fontSize: 16, fontWeight: "800", color: "#111827" },
  option: {
    minHeight: 46, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E2E8F0",
  },
  optionText: { flex: 1, fontSize: 13, fontWeight: "600", color: "#475569" },
  selectedOptionText: { color: "#2563EB", fontWeight: "800" },
  sheetCloseButton: { alignItems: "center", justifyContent: "center", backgroundColor: "#F1F5F9", borderRadius: 10, paddingVertical: 12, marginTop: 14 },
  sheetCloseText: { color: "#334155", fontSize: 13, fontWeight: "700" },
});
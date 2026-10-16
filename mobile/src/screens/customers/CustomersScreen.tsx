import React, {

  useCallback,

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

} from "react-native";



import { Ionicons } from "@expo/vector-icons";

import { useFocusEffect } from "@react-navigation/native";

import { useTranslation } from "../../context/LanguageContext";



import CustomerCard from "../../components/CustomerCard";



import {

  getCustomers,

  deleteCustomer,

} from "../../services/customerService";



import { getJobs } from "../../services/jobService";



type FilterType = "all" | "pending" | "paid" | "noJobs";



type SortType =

  | "recent"

  | "nameAsc"

  | "nameDesc"

  | "highestSpent"

  | "highestPending"

  | "mostVisits";



export default function CustomerScreen({ navigation }: any) {

  const { t } = useTranslation();



  const [customers, setCustomers] = useState<any[]>([]);

  const [jobs, setJobs] = useState<any[]>([]);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<FilterType>("all");

  const [sort, setSort] = useState<SortType>("recent");

  const [refreshing, setRefreshing] = useState(false);

  const [menuCustomer, setMenuCustomer] = useState<any>(null);

  const [filterVisible, setFilterVisible] = useState(false);

  const [sortVisible, setSortVisible] = useState(false);



  // --------------------------------------------------

  // LOAD CUSTOMERS AND JOBS

  // --------------------------------------------------



  const loadData = async () => {

    try {

      const [customerResponse, jobResponse] = await Promise.all([

        getCustomers(),

        getJobs(),

      ]);



      const customerList = Array.isArray(customerResponse?.customers)

        ? customerResponse.customers

        : [];



      const rawJobList =

        jobResponse?.jobs ?? jobResponse?.data ?? [];



      const jobList = Array.isArray(rawJobList) ? rawJobList : [];



      setJobs(jobList);



      const normalizedCustomers = customerList.map((customer: any) => {

        const customerJobs = jobList.filter(

          (job: any) => job.customerId === customer.customerId

        );



        const completedJobs = customerJobs.filter(

          (job: any) => job.status === "completed"

        );



        const pendingJobs = customerJobs.filter(

          (job: any) => job.status !== "completed"

        );



        const totalSpent = completedJobs.reduce(

          (total: number, job: any) =>

            total + Number(job.totalAmount || 0),

          0

        );



        const pendingAmount = pendingJobs.reduce(

          (total: number, job: any) =>

            total + Number(job.totalAmount || 0),

          0

        );



        const lastJob = [...customerJobs].sort(

          (a: any, b: any) =>

            new Date(b.updatedAt || b.createdAt || 0).getTime() -

            new Date(a.updatedAt || a.createdAt || 0).getTime()

        )[0];



        return {

          ...customer,

          totalJobs: customerJobs.length,

          totalSpent,

          pendingAmount,

          lastVisit:

            lastJob?.updatedAt ||

            lastJob?.createdAt ||

            customer.createdAt,

        };

      });



      setCustomers(normalizedCustomers);

    } catch (error) {

      console.log("Customer load error:", error);



      Alert.alert(

        t("common.errorTitle"),

        t("customers.loadError")

      );

    }

  };



  useFocusEffect(

    useCallback(() => {

      loadData();

    }, [])

  );



  // --------------------------------------------------

  // REFRESH

  // --------------------------------------------------



  const handleRefresh = async () => {

    try {

      setRefreshing(true);

      await loadData();

    } finally {

      setRefreshing(false);

    }

  };



  // --------------------------------------------------

  // FILTER AND SORT CUSTOMERS

  // --------------------------------------------------



  const displayedCustomers = useMemo(() => {

    let result = [...customers];



    const query = search.trim().toLowerCase();



    if (query) {

      result = result.filter((customer) => {

        const name = String(customer.name || "").toLowerCase();

        const phone = String(customer.phone || "").toLowerCase();

        const alternatePhone = String(

          customer.alternatePhone || ""

        ).toLowerCase();



        return (

          name.includes(query) ||

          phone.includes(query) ||

          alternatePhone.includes(query)

        );

      });

    }



    if (filter === "pending") {

      result = result.filter(

        (customer) => Number(customer.pendingAmount || 0) > 0

      );

    }



    if (filter === "paid") {

      result = result.filter(

        (customer) =>

          Number(customer.pendingAmount || 0) === 0 &&

          Number(customer.totalJobs || 0) > 0

      );

    }



    if (filter === "noJobs") {

      result = result.filter(

        (customer) => Number(customer.totalJobs || 0) === 0

      );

    }



    result.sort((a, b) => {

      if (sort === "nameAsc") {

        return String(a.name || "")

          .toLowerCase()

          .localeCompare(String(b.name || "").toLowerCase());

      }



      if (sort === "nameDesc") {

        return String(b.name || "")

          .toLowerCase()

          .localeCompare(String(a.name || "").toLowerCase());

      }



      if (sort === "highestSpent") {

        return Number(b.totalSpent || 0) - Number(a.totalSpent || 0);

      }



      if (sort === "highestPending") {

        return (

          Number(b.pendingAmount || 0) -

          Number(a.pendingAmount || 0)

        );

      }



      if (sort === "mostVisits") {

        return Number(b.totalJobs || 0) - Number(a.totalJobs || 0);

      }



      return (

        new Date(

          b.lastVisit || b.updatedAt || b.createdAt || 0

        ).getTime() -

        new Date(

          a.lastVisit || a.updatedAt || a.createdAt || 0

        ).getTime()

      );

    });



    return result;

  }, [customers, search, filter, sort]);



  // --------------------------------------------------

  // DELETE CUSTOMER

  // --------------------------------------------------



  const handleDelete = (customer: any) => {

    const customerJobs = jobs.filter(

      (job: any) => job.customerId === customer.customerId

    );



    setMenuCustomer(null);



    if (customerJobs.length > 0) {

      Alert.alert(

        t("customers.cannotDeleteTitle"),

        `${customerJobs.length} ${t(

          "customers.linkedJobsMessage"

        )}\n\n${t("customers.historyCannotBeDeleted")}`,

        [{ text: t("common.ok") }]

      );



      return;

    }



    Alert.alert(

      t("customers.deleteCustomerTitle"),

      `${t("customers.deleteConfirm")} ${customer.name}?`,

      [

        {

          text: t("common.cancel"),

          style: "cancel",

        },

        {

          text: t("common.delete"),

          style: "destructive",

          onPress: async () => {

            try {

              await deleteCustomer(customer.customerId);



              setCustomers((previous) =>

                previous.filter(

                  (item) => item.customerId !== customer.customerId

                )

              );



              Alert.alert(

                t("customers.deletedTitle"),

                t("customers.deleteSuccess")

              );

            } catch (error: any) {

              Alert.alert(

                t("customers.deleteFailedTitle"),

                error?.response?.data?.message ||

                  t("customers.deleteError")

              );

            }

          },

        },

      ]

    );

  };



  // --------------------------------------------------

  // FILTER AND SORT OPTIONS

  // --------------------------------------------------



  const filterOptions: { key: FilterType; label: string }[] = [

    { key: "all", label: t("customers.allCustomers") },

    { key: "pending", label: t("customers.pendingPayment") },

    { key: "paid", label: t("customers.paidCustomers") },

    { key: "noJobs", label: t("customers.noJobsYet") },

  ];



  const sortOptions: { key: SortType; label: string }[] = [

    { key: "recent", label: t("customers.recentlyUpdated") },

    { key: "nameAsc", label: t("customers.nameAsc") },

    { key: "nameDesc", label: t("customers.nameDesc") },

    { key: "highestSpent", label: t("customers.highestSpent") },

    { key: "highestPending", label: t("customers.highestDue") },

    { key: "mostVisits", label: t("customers.mostVisits") },

  ];



  // --------------------------------------------------

  // SCREEN

  // --------------------------------------------------



  return (

    <View style={styles.container}>

      {/* HEADER - matches InventoryScreen */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTextGroup}>
          <Text style={styles.title} numberOfLines={1}>
            {t("customers.title")}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {displayedCustomers.length} {t("customers.customerCount")}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("AddCustomer")}
          accessibilityRole="button"
          accessibilityLabel={t("customers.addCustomer")}
        >
          <Ionicons name="add" size={23} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* SEARCH + ICON-ONLY FILTER + SORT */}
      <View style={styles.searchControlsRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={17} color="#94A3B8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t("customers.searchPlaceholder")}
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            returnKeyType="search"
            autoCapitalize="none"
            numberOfLines={1}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t("common.clearSearch")}
            >
              <Ionicons name="close-circle" size={17} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.compactControlButton, filter !== "all" && styles.activeControlButton]}
          onPress={() => setFilterVisible(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t("customers.filterCustomers")}
        >
          <Ionicons name="filter-outline" size={17} color={filter !== "all" ? "#2563EB" : "#475569"} />
          {filter !== "all" && <View style={styles.activeFilterDot} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.compactControlButton, sort !== "recent" && styles.activeControlButton]}
          onPress={() => setSortVisible(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t("customers.sortCustomers")}
        >
          <Ionicons name="swap-vertical-outline" size={19} color={sort !== "recent" ? "#2563EB" : "#475569"} />
          {sort !== "recent" && <View style={styles.activeFilterDot} />}
        </TouchableOpacity>
      </View>

      {/* CUSTOMER LIST */}



      <FlatList

        data={displayedCustomers}

        keyExtractor={(item, index) =>

          String(item.customerId || item.id || index)

        }

        renderItem={({ item }) => (

          <CustomerCard

            customer={item}

            onPress={() =>

              navigation.navigate("CustomerDetail", {

                customer: item,

              })

            }

            onMenuPress={() => setMenuCustomer(item)}

          />

        )}

        refreshControl={

          <RefreshControl

            refreshing={refreshing}

            onRefresh={handleRefresh}

          />

        }

        contentContainerStyle={

          displayedCustomers.length === 0

            ? styles.emptyContainer

            : styles.list

        }

        keyboardShouldPersistTaps="handled"

        ListEmptyComponent={

          <View style={styles.empty}>

            <Ionicons

              name="people-outline"

              size={40}

              color="#CBD5E1"

            />



            <Text style={styles.emptyTitle}>

              {t("customers.noCustomersFound")}

            </Text>



            <Text style={styles.emptyText}>

              {t("customers.adjustSearchFilter")}

            </Text>

          </View>

        }

      />



      {/* CUSTOMER MENU */}



      <Modal

        visible={!!menuCustomer}

        transparent

        animationType="fade"

        onRequestClose={() => setMenuCustomer(null)}

      >

        <TouchableOpacity

          style={styles.modalOverlay}

          activeOpacity={1}

          onPress={() => setMenuCustomer(null)}

        >

          <View style={styles.menu}>

            <View style={styles.menuHeader}>

              <Text style={styles.menuTitle} numberOfLines={1}>

                {menuCustomer?.name}

              </Text>



              <TouchableOpacity

                onPress={() => setMenuCustomer(null)}

                hitSlop={8}

              >

                <Ionicons

                  name="close"

                  size={20}

                  color="#64748B"

                />

              </TouchableOpacity>

            </View>



            <TouchableOpacity

              style={styles.menuItem}

              onPress={() => {

                const customer = menuCustomer;

                setMenuCustomer(null);



                navigation.navigate("CustomerDetail", {

                  customer,

                });

              }}

            >

              <Ionicons

                name="person-outline"

                size={20}

                color="#2563EB"

              />

              <Text style={styles.menuItemText}>

                {t("customers.viewCustomer")}

              </Text>

            </TouchableOpacity>



            <TouchableOpacity

              style={styles.menuItem}

              onPress={() => {

                const customer = menuCustomer;

                setMenuCustomer(null);



                navigation.navigate("EditCustomer", {

                  customer,

                });

              }}

            >

              <Ionicons

                name="create-outline"

                size={20}

                color="#2563EB"

              />

              <Text style={styles.menuItemText}>

                {t("customers.editCustomer")}

              </Text>

            </TouchableOpacity>



            <TouchableOpacity

              style={[styles.menuItem, styles.deleteItem]}

              onPress={() => {

                if (menuCustomer) {

                  handleDelete(menuCustomer);

                }

              }}

            >

              <Ionicons

                name="trash-outline"

                size={20}

                color="#DC2626"

              />

              <Text

                style={[

                  styles.menuItemText,

                  styles.deleteText,

                ]}

              >

                {t("customers.deleteCustomer")}

              </Text>

            </TouchableOpacity>

          </View>

        </TouchableOpacity>

      </Modal>



      {/* FILTER SHEET */}



      <Modal

        visible={filterVisible}

        transparent

        animationType="slide"

        onRequestClose={() => setFilterVisible(false)}

      >

        <View style={styles.bottomOverlay}>

          <TouchableOpacity

            style={styles.sheetDismissArea}

            activeOpacity={1}

            onPress={() => setFilterVisible(false)}

          />



          <View style={styles.bottomSheet}>

            <View style={styles.sheetHeader}>

              <Text style={styles.sheetTitle}>

                {t("customers.filterCustomers")}

              </Text>



              <TouchableOpacity

                onPress={() => setFilterVisible(false)}

                hitSlop={8}

              >

                <Ionicons

                  name="close"

                  size={21}

                  color="#64748B"

                />

              </TouchableOpacity>

            </View>



            {filterOptions.map((item) => (

              <TouchableOpacity

                key={item.key}

                style={styles.option}

                onPress={() => {

                  setFilter(item.key);

                  setFilterVisible(false);

                }}

              >

                <Text style={styles.optionText}>

                  {item.label}

                </Text>



                {filter === item.key && (

                  <Ionicons

                    name="checkmark"

                    size={20}

                    color="#2563EB"

                  />

                )}

              </TouchableOpacity>

            ))}

          </View>

        </View>

      </Modal>



      {/* SORT SHEET */}



      <Modal

        visible={sortVisible}

        transparent

        animationType="slide"

        onRequestClose={() => setSortVisible(false)}

      >

        <View style={styles.bottomOverlay}>

          <TouchableOpacity

            style={styles.sheetDismissArea}

            activeOpacity={1}

            onPress={() => setSortVisible(false)}

          />



          <View style={styles.bottomSheet}>

            <View style={styles.sheetHeader}>

              <Text style={styles.sheetTitle}>

                {t("customers.sortCustomers")}

              </Text>



              <TouchableOpacity

                onPress={() => setSortVisible(false)}

                hitSlop={8}

              >

                <Ionicons

                  name="close"

                  size={21}

                  color="#64748B"

                />

              </TouchableOpacity>

            </View>



            {sortOptions.map((item) => (

              <TouchableOpacity

                key={item.key}

                style={styles.option}

                onPress={() => {

                  setSort(item.key);

                  setSortVisible(false);

                }}

              >

                <Text style={styles.optionText}>

                  {item.label}

                </Text>



                {sort === item.key && (

                  <Ionicons

                    name="checkmark"

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

  );

}



const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 10,
    gap: 8,
  },
  headerTextGroup: { flex: 1, minWidth: 0 },
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtitle: { fontSize: 11, color: "#64748B", marginTop: 2 },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
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
  searchInput: { flex: 1, minWidth: 0, fontSize: 12, color: "#0F172A", paddingVertical: 0 },
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
  activeControlButton: { borderColor: "#BFDBFE", backgroundColor: "#EFF6FF" },
  activeFilterDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563EB",
  },

  list: {

    paddingBottom: 25,

  },



  emptyContainer: {

    flexGrow: 1,

    justifyContent: "center",

  },



  empty: {

    alignItems: "center",

    paddingHorizontal: 18,

    paddingBottom: 60,

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

    marginTop: 4,

    textAlign: "center",

  },



  modalOverlay: {

    flex: 1,

    backgroundColor: "rgba(0,0,0,0.25)",

    justifyContent: "flex-start",

    alignItems: "flex-end",

    paddingTop: 125,

    paddingRight: 12,

  },



  menu: {

    width: 230,

    maxWidth: "100%",

    backgroundColor: "#FFFFFF",

    borderRadius: 14,

    paddingVertical: 6,

    elevation: 8,

    shadowColor: "#000",

    shadowOpacity: 0.15,

    shadowRadius: 12,

    shadowOffset: {

      width: 0,

      height: 5,

    },

  },



  menuHeader: {

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    paddingHorizontal: 14,

    paddingVertical: 10,

    borderBottomWidth: 1,

    borderBottomColor: "#F1F5F9",

    gap: 8,

  },



  menuTitle: {

    flex: 1,

    minWidth: 0,

    fontSize: 14,

    fontWeight: "800",

    color: "#111827",

  },



  menuItem: {

    minHeight: 46,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 14,

    paddingVertical: 10,

    gap: 12,

  },



  menuItemText: {

    flex: 1,

    flexShrink: 1,

    fontSize: 13,

    fontWeight: "600",

    color: "#334155",

  },



  deleteItem: {

    borderTopWidth: 1,

    borderTopColor: "#F1F5F9",

  },



  deleteText: {

    color: "#DC2626",

  },



  bottomOverlay: {

    flex: 1,

    backgroundColor: "rgba(0,0,0,0.3)",

    justifyContent: "flex-end",

  },



  sheetDismissArea: {

    flex: 1,

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

    flex: 1,

    fontSize: 17,

    fontWeight: "800",

    color: "#111827",

  },



  option: {

    minHeight: 48,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    gap: 12,

    paddingVertical: 10,

    borderBottomWidth: 1,

    borderBottomColor: "#F1F5F9",

  },



  optionText: {

    flex: 1,

    flexShrink: 1,

    fontSize: 13,

    color: "#334155",

    fontWeight: "600",

  },

});
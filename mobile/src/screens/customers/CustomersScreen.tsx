import React, {
  useCallback,
  useMemo,
  useState
} from "react"

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal
} from "react-native"

import {
  Ionicons
} from "@expo/vector-icons"

import {
  useFocusEffect
} from "@react-navigation/native"

import CustomerCard
  from "../../components/CustomerCard"

import {
  getCustomers,
  deleteCustomer
} from "../../services/customerService"

import {
  getJobs
} from "../../services/jobService"


type FilterType =
  | "all"
  | "pending"
  | "paid"
  | "noJobs"

type SortType =
  | "recent"
  | "nameAsc"
  | "nameDesc"
  | "highestSpent"
  | "highestPending"
  | "mostVisits"


export default function CustomerScreen({
  navigation
}: any) {

  const [customers, setCustomers] =
    useState<any[]>([])

  const [jobs, setJobs] =
    useState<any[]>([])

  const [search, setSearch] =
    useState("")

  const [filter, setFilter] =
    useState<FilterType>("all")

  const [sort, setSort] =
    useState<SortType>("recent")

  const [refreshing, setRefreshing] =
    useState(false)

  const [menuCustomer, setMenuCustomer] =
    useState<any>(null)

  const [filterVisible, setFilterVisible] =
    useState(false)

  const [sortVisible, setSortVisible] =
    useState(false)


  /*
  |--------------------------------------------------------------------------
  | LOAD DATA
  |--------------------------------------------------------------------------
  */

  const loadData = async () => {

    try {

      const [
        customerResponse,
        jobResponse
      ] = await Promise.all([
        getCustomers(),
        getJobs()
      ])


      const customerList =
        customerResponse?.customers ||
        []

      const jobList =
        jobResponse?.jobs ||
        jobResponse?.data ||
        []


      setJobs(
        Array.isArray(jobList)
          ? jobList
          : []
      )


      const normalizedCustomers =
        customerList.map(
          (customer: any) => {

            const customerJobs =
              jobList.filter(
                (job: any) =>
                  job.customerId ===
                  customer.customerId
              )


            const completedJobs =
              customerJobs.filter(
                (job: any) =>
                  job.status ===
                  "completed"
              )


            const pendingJobs =
              customerJobs.filter(
                (job: any) =>
                  job.status !==
                  "completed"
              )


            const totalSpent =
              completedJobs.reduce(
                (
                  total: number,
                  job: any
                ) =>
                  total +
                  Number(
                    job.totalAmount || 0
                  ),
                0
              )


            const pendingAmount =
              pendingJobs.reduce(
                (
                  total: number,
                  job: any
                ) =>
                  total +
                  Number(
                    job.totalAmount || 0
                  ),
                0
              )


            const lastJob =
              [...customerJobs].sort(
                (
                  a: any,
                  b: any
                ) =>
                  new Date(
                    b.updatedAt ||
                    b.createdAt ||
                    0
                  ).getTime() -
                  new Date(
                    a.updatedAt ||
                    a.createdAt ||
                    0
                  ).getTime()
              )[0]


            return {

              ...customer,

              totalJobs:
                customerJobs.length,

              totalSpent,

              pendingAmount,

              lastVisit:
                lastJob?.updatedAt ||
                lastJob?.createdAt ||
                customer.createdAt

            }

          }
        )


      setCustomers(
        normalizedCustomers
      )

    } catch (error) {

      console.log(
        "Customer load error:",
        error
      )

      Alert.alert(
        "Error",
        "Unable to load customers."
      )

    }

  }


  useFocusEffect(
    useCallback(() => {

      loadData()

    }, [])
  )


  /*
  |--------------------------------------------------------------------------
  | REFRESH
  |--------------------------------------------------------------------------
  */

  const handleRefresh =
    async () => {

      try {

        setRefreshing(true)

        await loadData()

      } finally {

        setRefreshing(false)

      }

    }


  /*
  |--------------------------------------------------------------------------
  | FILTER + SORT
  |--------------------------------------------------------------------------
  */

  const displayedCustomers =
    useMemo(() => {

      let result =
        [...customers]


      /*
       * SEARCH
       */

      const query =
        search
          .trim()
          .toLowerCase()


      if (query) {

        result =
          result.filter(
            customer =>

              customer.name
                ?.toLowerCase()
                .includes(query) ||

              customer.phone
                ?.toLowerCase()
                .includes(query) ||

              customer.alternatePhone
                ?.toLowerCase()
                .includes(query)
          )

      }


      /*
       * FILTER
       */

      if (filter === "pending") {

        result =
          result.filter(
            customer =>
              Number(
                customer.pendingAmount ||
                0
              ) > 0
          )

      }


      if (filter === "paid") {

        result =
          result.filter(
            customer =>
              Number(
                customer.pendingAmount ||
                0
              ) === 0 &&
              Number(
                customer.totalJobs ||
                0
              ) > 0
          )

      }


      if (filter === "noJobs") {

        result =
          result.filter(
            customer =>
              Number(
                customer.totalJobs ||
                0
              ) === 0
          )

      }


      /*
       * SORT
       */

      result.sort(
        (a, b) => {

          if (
            sort ===
            "nameAsc"
          ) {

            return (
              String(a.name || "")
                .toLowerCase()
                .localeCompare(
                  String(
                    b.name || ""
                  ).toLowerCase()
                )
            )

          }


          if (
            sort ===
            "nameDesc"
          ) {

            return (
              String(b.name || "")
                .toLowerCase()
                .localeCompare(
                  String(
                    a.name || ""
                  ).toLowerCase()
                )
            )

          }


          if (
            sort ===
            "highestSpent"
          ) {

            return (
              Number(
                b.totalSpent || 0
              ) -
              Number(
                a.totalSpent || 0
              )
            )

          }


          if (
            sort ===
            "highestPending"
          ) {

            return (
              Number(
                b.pendingAmount || 0
              ) -
              Number(
                a.pendingAmount || 0
              )
            )

          }


          if (
            sort ===
            "mostVisits"
          ) {

            return (
              Number(
                b.totalJobs || 0
              ) -
              Number(
                a.totalJobs || 0
              )
            )

          }


          /*
           * DEFAULT:
           * Recently updated/created.
           */

          return (
            new Date(
              b.lastVisit ||
              b.updatedAt ||
              b.createdAt ||
              0
            ).getTime() -
            new Date(
              a.lastVisit ||
              a.updatedAt ||
              a.createdAt ||
              0
            ).getTime()
          )

        }
      )


      return result

    }, [
      customers,
      search,
      filter,
      sort
    ])


  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const handleDelete =
    (customer: any) => {

      const customerJobs =
        jobs.filter(
          (job: any) =>
            job.customerId ===
            customer.customerId
        )


      setMenuCustomer(null)


      if (
        customerJobs.length > 0
      ) {

        Alert.alert(
          "Cannot Delete Customer",
          `This customer has ${customerJobs.length} job${
            customerJobs.length > 1
              ? "s"
              : ""
          } linked to their account.\n\nCustomer history cannot be deleted.`,
          [
            {
              text: "OK"
            }
          ]
        )

        return
      }


      Alert.alert(
        "Delete Customer",
        `Are you sure you want to delete ${customer.name}?`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },

          {
            text: "Delete",
            style: "destructive",

            onPress:
              async () => {

                try {

                  await deleteCustomer(
                    customer.customerId
                  )


                  setCustomers(
                    previous =>
                      previous.filter(
                        item =>
                          item.customerId !==
                          customer.customerId
                      )
                  )


                  Alert.alert(
                    "Deleted",
                    "Customer deleted successfully."
                  )

                } catch (
                  error: any
                ) {

                  Alert.alert(
                    "Delete Failed",
                    error?.response
                      ?.data
                      ?.message ||
                      "Unable to delete customer."
                  )

                }

              }

          }

        ]
      )

    }


  /*
  |--------------------------------------------------------------------------
  | SORT LABEL
  |--------------------------------------------------------------------------
  */

  const getSortLabel =
    () => {

      switch (sort) {

        case "nameAsc":
          return "Name A–Z"

        case "nameDesc":
          return "Name Z–A"

        case "highestSpent":
          return "Highest Spent"

        case "highestPending":
          return "Highest Due"

        case "mostVisits":
          return "Most Visits"

        default:
          return "Recent"

      }

    }


  /*
  |--------------------------------------------------------------------------
  | FILTER LABEL
  |--------------------------------------------------------------------------
  */

  const getFilterLabel =
    () => {

      switch (filter) {

        case "pending":
          return "Pending"

        case "paid":
          return "Paid"

        case "noJobs":
          return "No Jobs"

        default:
          return "All"

      }

    }


  return (

    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <View>

          <Text style={styles.title}>
            Customers
          </Text>

          <Text style={styles.subtitle}>
            {displayedCustomers.length} customers
          </Text>

        </View>


        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate(
              "AddCustomer"
            )
          }
        >

          <Ionicons
            name="add"
            size={22}
            color="#FFFFFF"
          />

        </TouchableOpacity>

      </View>


      {/* SEARCH */}

      <View style={styles.searchBox}>

        <Ionicons
          name="search"
          size={18}
          color="#94A3B8"
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search name or phone"
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
        />

        {search.length > 0 && (

          <TouchableOpacity
            onPress={() =>
              setSearch("")
            }
          >

            <Ionicons
              name="close-circle"
              size={18}
              color="#94A3B8"
            />

          </TouchableOpacity>

        )}

      </View>


      {/* FILTER / SORT */}

      <View style={styles.controls}>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() =>
            setFilterVisible(true)
          }
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
          onPress={() =>
            setSortVisible(true)
          }
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


      {/* CUSTOMER LIST */}

      <FlatList

        data={
          displayedCustomers
        }

        keyExtractor={
          item =>
            item.customerId
        }

        renderItem={({
          item
        }) => (

          <CustomerCard

            customer={item}

            onPress={() =>
              navigation.navigate(
                "CustomerDetail",
                {
                  customer: item
                }
              )
            }

            onMenuPress={() =>
              setMenuCustomer(
                item
              )
            }

          />

        )}

        refreshControl={

          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
          />

        }

        contentContainerStyle={
          displayedCustomers.length === 0
            ? styles.emptyContainer
            : styles.list
        }

        ListEmptyComponent={

          <View style={styles.empty}>

            <Ionicons
              name="people-outline"
              size={40}
              color="#CBD5E1"
            />

            <Text style={styles.emptyTitle}>
              No customers found
            </Text>

            <Text style={styles.emptyText}>
              Try changing your search or filters.
            </Text>

          </View>

        }

      />


      {/* CUSTOMER MENU */}

      <Modal
        visible={
          !!menuCustomer
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setMenuCustomer(null)
        }
      >

        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() =>
            setMenuCustomer(null)
          }
        >

          <View
            style={styles.menu}
          >

            <View style={styles.menuHeader}>

              <Text
                style={styles.menuTitle}
              >
                {menuCustomer?.name}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setMenuCustomer(null)
                }
              >

                <Ionicons
                  name="close"
                  size={20}
                  color="#64748B"
                />

              </TouchableOpacity>

            </View>


            {/* VIEW */}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {

                const customer =
                  menuCustomer

                setMenuCustomer(
                  null
                )

                navigation.navigate(
                  "CustomerDetail",
                  {
                    customer
                  }
                )

              }}
            >

              <Ionicons
                name="person-outline"
                size={20}
                color="#2563EB"
              />

              <Text
                style={styles.menuItemText}
              >
                View Customer
              </Text>

            </TouchableOpacity>


            {/* EDIT */}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {

                const customer =
                  menuCustomer

                setMenuCustomer(
                  null
                )

                navigation.navigate(
                  "EditCustomer",
                  {
                    customer
                  }
                )

              }}
            >

              <Ionicons
                name="create-outline"
                size={20}
                color="#2563EB"
              />

              <Text
                style={styles.menuItemText}
              >
                Edit Customer
              </Text>

            </TouchableOpacity>


            {/* DELETE */}

            <TouchableOpacity
              style={[
                styles.menuItem,
                styles.deleteItem
              ]}
              onPress={() => {

                const customer =
                  menuCustomer

                handleDelete(
                  customer
                )

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
                  {
                    color:
                      "#DC2626"
                  }
                ]}
              >
                Delete Customer
              </Text>

            </TouchableOpacity>

          </View>

        </TouchableOpacity>

      </Modal>


      {/* FILTER MODAL */}

      <Modal
        visible={
          filterVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setFilterVisible(false)
        }
      >

        <View
          style={styles.bottomOverlay}
        >

          <View
            style={styles.bottomSheet}
          >

            <Text
              style={styles.sheetTitle}
            >
              Filter Customers
            </Text>


            {[
              {
                key: "all",
                label: "All Customers"
              },
              {
                key: "pending",
                label: "Pending Payment"
              },
              {
                key: "paid",
                label: "Paid Customers"
              },
              {
                key: "noJobs",
                label: "No Jobs Yet"
              }
            ].map(item => (

              <TouchableOpacity
                key={item.key}
                style={styles.option}
                onPress={() => {

                  setFilter(
                    item.key as FilterType
                  )

                  setFilterVisible(
                    false
                  )

                }}
              >

                <Text
                  style={styles.optionText}
                >
                  {item.label}
                </Text>

                {filter ===
                  item.key && (

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


      {/* SORT MODAL */}

      <Modal
        visible={
          sortVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setSortVisible(false)
        }
      >

        <View
          style={styles.bottomOverlay}
        >

          <View
            style={styles.bottomSheet}
          >

            <Text
              style={styles.sheetTitle}
            >
              Sort Customers
            </Text>


            {[
              {
                key: "recent",
                label: "Recently Updated"
              },
              {
                key: "nameAsc",
                label: "Name A–Z"
              },
              {
                key: "nameDesc",
                label: "Name Z–A"
              },
              {
                key: "highestSpent",
                label: "Highest Spent"
              },
              {
                key: "highestPending",
                label: "Highest Due"
              },
              {
                key: "mostVisits",
                label: "Most Visits"
              }
            ].map(item => (

              <TouchableOpacity
                key={item.key}
                style={styles.option}
                onPress={() => {

                  setSort(
                    item.key as SortType
                  )

                  setSortVisible(
                    false
                  )

                }}
              >

                <Text
                  style={styles.optionText}
                >
                  {item.label}
                </Text>

                {sort ===
                  item.key && (

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

  )
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 10
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827"
  },

  subtitle: {
    marginTop: 2,
    fontSize: 11,
    color: "#64748B"
  },

  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center"
  },

  searchBox: {
    height: 42,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11
  },

  searchInput: {
    flex: 1,
    marginLeft: 7,
    fontSize: 12,
    color: "#111827"
  },

  controls: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 9
  },

  controlButton: {
    height: 34,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },

  controlText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569"
  },

  list: {
    paddingBottom: 25
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center"
  },

  empty: {
    alignItems: "center",
    paddingBottom: 80
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginTop: 10
  },

  emptyText: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 4
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.25)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 125,
    paddingRight: 12
  },

  menu: {
    width: 220,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 6,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5
    }
  },

  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },

  menuTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: "#111827"
  },

  menuItem: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 12
  },

  menuItemText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155"
  },

  deleteItem: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9"
  },

  bottomOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.3)",
    justifyContent: "flex-end"
  },

  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 30
  },

  sheetTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8
  },

  option: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },

  optionText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "600"
  }

})
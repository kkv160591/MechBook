// DashboardScreen.tsx

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator
} from "react-native"

import {
  useState,
  useCallback
} from "react"

import {
  getGarageProfile
} from "../../services/garageService"

import {
  getJobs
} from "../../services/jobService"

import {
  getWorkers
} from "../../services/workerService"

import {
  getLowStockItems
} from "../../services/inventoryService"

import {
  MaterialIcons,
  Ionicons,
  FontAwesome5
} from "@expo/vector-icons"

import {
  useNavigation,
  useFocusEffect
} from "@react-navigation/native"

import {
  useAuth
} from "../../context/AuthContext"

import {
  getPlanUsage,
  PlanUsageResponse
} from "../../services/subscriptionService"


export default function DashboardScreen() {

  const navigation: any =
    useNavigation()

  const {
    user
  } = useAuth()


  // ==================================
  // STATE
  // ==================================

  const [garage, setGarage] =
    useState<any>(null)

  const [jobs, setJobs] =
    useState<any[]>([])

  const [workers, setWorkers] =
    useState<any[]>([])

  const [lowStockItems, setLowStockItems] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [planUsage, setPlanUsage] =
    useState<PlanUsageResponse | null>(null)

  const [planUsageLoading, setPlanUsageLoading] =
    useState(true)


  // ==================================
  // LOAD SUBSCRIPTION
  // ==================================

  const loadSubscription =
    useCallback(
      async () => {

        try {

          setPlanUsageLoading(true)

          const data =
            await getPlanUsage()

          console.log(
            "========== DASHBOARD SUBSCRIPTION =========="
          )

          console.log(
            "garageId:",
            data?.garageId
          )

          console.log(
            "planCode:",
            data?.planCode
          )

          console.log(
            "planName:",
            data?.planName
          )

          console.log(
            "billingCycle:",
            data?.billingCycle
          )

          console.log(
            "jobsUsed:",
            data?.jobsUsed
          )

          console.log(
            "jobsLimit:",
            data?.jobsLimit
          )

          console.log(
            "boosterJobs:",
            data?.boosterJobs
          )

          console.log(
            "usagePercentage:",
            data?.usagePercentage
          )

          console.log(
            "jobsRemaining:",
            data?.jobsRemaining
          )

          console.log(
            "============================================"
          )


          setPlanUsage(data)

        }

        catch (error) {

          console.log(
            "Failed to load dashboard subscription:",
            error
          )

          /*
           * Do not destroy existing subscription
           * information if a refresh fails.
           */

        }

        finally {

          setPlanUsageLoading(false)

        }

      },
      []
    )


  // ==================================
  // LOAD DASHBOARD DATA
  // ==================================

  const loadDashboardData =
    useCallback(
      async () => {

        try {

          setLoading(true)

          const [
            garageResponse,
            jobsResponse,
            workersResponse,
            lowStockResponse
          ] =
            await Promise.all([

              getGarageProfile(),

              getJobs(),

              getWorkers(),

              getLowStockItems()

            ])


          console.log(
            "Dashboard Garage:",
            garageResponse?.garage
          )

          console.log(
            "Dashboard Jobs:",
            jobsResponse
          )

          console.log(
            "Dashboard Workers:",
            workersResponse
          )

          console.log(
            "Dashboard Low Stock:",
            lowStockResponse
          )


          // ----------------------------
          // GARAGE
          // ----------------------------

          setGarage(
            garageResponse?.garage ||
            null
          )


          // ----------------------------
          // JOBS
          // ----------------------------

          const jobList =
            Array.isArray(jobsResponse)

              ? jobsResponse

              : Array.isArray(
                  jobsResponse?.jobs
                )

                ? jobsResponse.jobs

                : []

          setJobs(jobList)


          // ----------------------------
          // WORKERS
          // ----------------------------

          const workerList =
            Array.isArray(workersResponse)

              ? workersResponse

              : Array.isArray(
                  workersResponse?.workers
                )

                ? workersResponse.workers

                : []

          setWorkers(workerList)


          // ----------------------------
          // LOW STOCK
          // ----------------------------

          const inventoryList =
            Array.isArray(lowStockResponse)

              ? lowStockResponse

              : Array.isArray(
                  lowStockResponse?.items
                )

                ? lowStockResponse.items

                : []

          setLowStockItems(
            inventoryList
          )

        }

        catch (error) {

          console.log(
            "Failed to load dashboard:",
            error
          )

        }

        finally {

          setLoading(false)

        }

      },
      []
    )


  // ==================================
  // LOAD EVERYTHING WHEN SCREEN
  // GETS FOCUS
  // ==================================

  useFocusEffect(
    useCallback(
      () => {

        /*
         * Refresh both dashboard data AND
         * subscription data whenever the
         * dashboard becomes active.
         */

        void loadDashboardData()

        void loadSubscription()

      },
      [
        loadDashboardData,
        loadSubscription
      ]
    )
  )


  // ==================================
  // PULL TO REFRESH
  // ==================================

  const onRefresh =
    useCallback(
      async () => {

        try {

          setRefreshing(true)

          await Promise.all([

            loadDashboardData(),

            loadSubscription()

          ])

        }

        catch (error) {

          console.log(
            "Dashboard refresh failed:",
            error
          )

        }

        finally {

          setRefreshing(false)

        }

      },
      [
        loadDashboardData,
        loadSubscription
      ]
    )


  // ==================================
  // JOB STATISTICS
  // ==================================

  const totalJobs =
    jobs.length


  const completedJobs =
    jobs.filter(
      job =>
        job.status ===
        "completed"
    ).length


  const pendingJobs =
    jobs.filter(
      job =>
        job.status ===
        "pending"
    ).length


  const inProgressJobs =
    jobs.filter(
      job =>
        job.status === "progress" ||
        job.status === "in-progress" ||
        job.status === "inProgress"
    ).length


  // ==================================
  // DEMO REVENUE
  // ==================================

  /*
   * Keep this temporary until
   * invoice/revenue API is available.
   */

  const demoRevenue =
    48500


  // ==================================
  // ACTUAL PLAN INFORMATION
  // ==================================

  const actualPlanName =
    planUsage?.planName ||
    planUsage?.planCode ||
    "Free"


  // ==================================
  // ACTUAL USAGE
  // ==================================

  const rawJobsUsed =
    Number(
      planUsage?.jobsUsed ?? 0
    )


  const jobsUsed =
    Number.isFinite(rawJobsUsed)
      ? Math.max(
          rawJobsUsed,
          0
        )
      : 0


  /*
   * Determine whether the plan is
   * unlimited.
   */

  const jobsLimitValue =
    planUsage?.jobsLimit


  const isUnlimited =
    String(
      jobsLimitValue ?? ""
    )
      .trim()
      .toLowerCase() ===
      "unlimited"


  /*
   * Numeric limit for normal plans.
   */

  const numericJobLimit =
    Number(
      jobsLimitValue ?? 0
    )


  /*
   * Prefer the backend's usagePercentage.
   *
   * PlanUsageScreen also receives this
   * value from getPlanUsage().
   *
   * If the backend doesn't provide it,
   * calculate it locally as a fallback.
   */

  const backendUsagePercentage =
    Number(
      planUsage?.usagePercentage
    )


  const calculatedUsagePercentage =
    numericJobLimit > 0

      ? Math.round(
          (
            jobsUsed /
            numericJobLimit
          ) * 100
        )

      : 0


  const usagePercentage =
    isUnlimited

      ? 0

      : Number.isFinite(
          backendUsagePercentage
        )

        ? Math.min(
            Math.max(
              Math.round(
                backendUsagePercentage
              ),
              0
            ),
            100
          )

        : Math.min(
            Math.max(
              calculatedUsagePercentage,
              0
            ),
            100
          )


  /*
   * Remaining jobs.
   */

  const jobsRemaining =
    isUnlimited

      ? "Unlimited"

      : Math.max(
          numericJobLimit -
          jobsUsed,
          0
        )


  /*
   * Color the ring based on usage.
   */

  const planRingColor =
    isUnlimited

      ? "#16A34A"

      : usagePercentage >= 100

        ? "#DC2626"

        : usagePercentage >= 80

          ? "#EA580C"

          : "#2563EB"


  const planRingBackground =
    isUnlimited

      ? "#ECFDF5"

      : usagePercentage >= 100

        ? "#FEF2F2"

        : usagePercentage >= 80

          ? "#FFF7ED"

          : "#EFF6FF"


  // ==================================
  // DEMO PAYMENT DATA
  // ==================================

  /*
   * Temporary until invoice/payment
   * API is implemented.
   */

  const pendingPayments =
    2


  // ==================================
  // RECENT JOBS
  // ==================================

  const recentJobs =
    jobs.slice(0, 4)


  // ==================================
  // STATUS HELPERS
  // ==================================

  const getStatusColor =
    (
      status: string
    ) => {

      if (
        status ===
        "completed"
      ) {

        return "#16A34A"

      }


      if (
        status ===
        "pending"
      ) {

        return "#DC2626"

      }


      if (
        status === "progress" ||
        status === "in-progress" ||
        status === "inProgress"
      ) {

        return "#EA580C"

      }


      return "#2563EB"

    }


  const getStatusText =
    (
      status: string
    ) => {

      if (
        status ===
        "completed"
      ) {

        return "COMPLETED"

      }


      if (
        status ===
        "pending"
      ) {

        return "PENDING"

      }


      if (
        status === "progress" ||
        status === "in-progress" ||
        status === "inProgress"
      ) {

        return "IN PROGRESS"

      }


      return (
        status?.toUpperCase() ||
        "UNKNOWN"
      )

    }


  // ==================================
  // JOB TOTAL
  // ==================================

  const getJobTotal =
    (
      job: any
    ) => {

      if (
        typeof job.totalAmount ===
        "number"
      ) {

        return job.totalAmount

      }


      if (
        typeof job.total ===
        "number"
      ) {

        return job.total

      }


      if (
        Array.isArray(
          job.services
        )
      ) {

        return job.services.reduce(
          (
            sum: number,
            service: any
          ) => {

            return (
              sum +
              Number(
                service.actualPrice ??
                service.estimatedPrice ??
                0
              )
            )

          },
          0
        )

      }


      return 0

    }


  // ==================================
  // RENDER
  // ==================================

  return (

    <View
      style={styles.screen}
    >

      <ScrollView

        style={
          styles.container
        }

        showsVerticalScrollIndicator={
          false
        }

        refreshControl={

          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              onRefresh
            }
          />

        }

      >

        {/* ==========================
            HEADER
        ========================== */}

        <View
          style={
            styles.headerRow
          }
        >

          <View
            style={
              styles.headerInfo
            }
          >

            <Text
              style={
                styles.greeting
              }
            >
              Welcome Back 👋
            </Text>


            <Text
              style={
                styles.header
              }
              numberOfLines={1}
            >

              {loading
                ? "Loading..."
                : garage?.garageName ||
                  "Garage"}

            </Text>


            <Text
              style={
                styles.subHeader
              }
              numberOfLines={1}
            >

              {garage?.city

                ? `${garage.city}${
                    garage.state
                      ? `, ${garage.state}`
                      : ""
                  }`

                : garage?.address ||
                  "Garage Dashboard"}

            </Text>


            <Text
              style={
                styles.roleText
              }
            >

              {user?.role
                ?.toUpperCase() ||
                "USER"}

            </Text>

          </View>


          {/* ========================
              ACTUAL PLAN + USAGE
          ======================== */}

          <TouchableOpacity
            style={
              styles.planHeaderContainer
            }
            onPress={() =>
              navigation.navigate(
                "PlanUsage"
              )
            }
            activeOpacity={0.7}
          >

            <View
              style={[
                styles.planRing,
                {
                  borderColor:
                    planRingColor,

                  backgroundColor:
                    planRingBackground
                }
              ]}
            >

              {planUsageLoading ? (

                <ActivityIndicator
                  size="small"
                  color={
                    planRingColor
                  }
                />

              ) : isUnlimited ? (

                <>

                  <Text
                    style={[
                      styles.planRingNumber,
                      {
                        color:
                          planRingColor
                      }
                    ]}
                  >
                    ∞
                  </Text>

                  <Text
                    style={
                      styles.planRingLabel
                    }
                  >
                    USED
                  </Text>

                </>

              ) : (

                <>

                  <Text
                    style={[
                      styles.planRingNumber,
                      {
                        color:
                          planRingColor
                      }
                    ]}
                  >
                    {usagePercentage}%
                  </Text>

                  <Text
                    style={
                      styles.planRingLabel
                    }
                  >
                    USED
                  </Text>

                </>

              )}

            </View>


            {/* ACTUAL PLAN NAME */}

            <Text
              style={[
                styles.planNameHeader,
                {
                  color:
                    planRingColor
                }
              ]}
              numberOfLines={1}
            >
              {actualPlanName}
            </Text>


            {/* ACTUAL JOB COUNT */}

            {!planUsageLoading && (

              <Text
                style={
                  styles.planUsageHeader
                }
                numberOfLines={1}
              >

                {isUnlimited

                  ? `${jobsUsed} jobs`

                  : `${jobsUsed}/${numericJobLimit} jobs`}

              </Text>

            )}

          </TouchableOpacity>

        </View>


        {/* ==========================
            STATS
        ========================== */}

        <View
          style={
            styles.statsContainer
          }
        >

          {/* TOTAL JOBS */}

          <View
            style={
              styles.card
            }
          >

            <View
              style={
                styles.iconBox
              }
            >

              <MaterialIcons
                name="build"
                size={22}
                color="#2563EB"
              />

            </View>


            <Text
              style={
                styles.cardValue
              }
            >
              {totalJobs}
            </Text>


            <Text
              style={
                styles.cardTitle
              }
            >
              Total Jobs
            </Text>

          </View>


          {/* PENDING */}

          <View
            style={
              styles.card
            }
          >

            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor:
                    "#FEF2F2"
                }
              ]}
            >

              <MaterialIcons
                name="pending-actions"
                size={22}
                color="#DC2626"
              />

            </View>


            <Text
              style={
                styles.cardValue
              }
            >
              {pendingJobs}
            </Text>


            <Text
              style={
                styles.cardTitle
              }
            >
              Pending Jobs
            </Text>

          </View>


          {/* COMPLETED */}

          <View
            style={
              styles.card
            }
          >

            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor:
                    "#ECFDF5"
                }
              ]}
            >

              <MaterialIcons
                name="check-circle"
                size={22}
                color="#16A34A"
              />

            </View>


            <Text
              style={
                styles.cardValue
              }
            >
              {completedJobs}
            </Text>


            <Text
              style={
                styles.cardTitle
              }
            >
              Completed
            </Text>

          </View>


          {/* REVENUE */}

          <View
            style={
              styles.card
            }
          >

            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor:
                    "#EFF6FF"
                }
              ]}
            >

              <MaterialIcons
                name="payments"
                size={22}
                color="#2563EB"
              />

            </View>


            <Text
              style={
                styles.cardValue
              }
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              ₹
              {demoRevenue.toLocaleString(
                "en-IN"
              )}
            </Text>


            <Text
              style={
                styles.cardTitle
              }
            >
              Revenue
            </Text>

          </View>

        </View>


        {/* ==========================
            QUICK ACTIONS
        ========================== */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Quick Actions
        </Text>


        <View
          style={
            styles.quickActions
          }
        >

          {/* CREATE JOB */}

          <TouchableOpacity
            style={
              styles.actionBtn
            }
            onPress={() =>
              navigation.navigate(
                "CreateJob"
              )
            }
            activeOpacity={0.7}
          >

            <MaterialIcons
              name="add-circle"
              size={30}
              color="#2563EB"
            />


            <Text
              style={
                styles.actionText
              }
            >
              Create Job
            </Text>

          </TouchableOpacity>


          {/* INVOICE */}

          <TouchableOpacity
            style={
              styles.actionBtn
            }
            onPress={() =>
              navigation.navigate(
                "Invoice"
              )
            }
            activeOpacity={0.7}
          >

            <FontAwesome5
              name="file-invoice"
              size={24}
              color="#2563EB"
            />


            <Text
              style={
                styles.actionText
              }
            >
              Invoices
            </Text>

          </TouchableOpacity>

        </View>


        {/* ==========================
            BUSINESS OVERVIEW
        ========================== */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Business Overview
        </Text>


        <View
          style={
            styles.overviewCard
          }
        >

          {/* WORKERS */}

          <View
            style={
              styles.overviewRow
            }
          >

            <View
              style={
                styles.overviewIcon
              }
            >

              <Ionicons
                name="people-outline"
                size={20}
                color="#2563EB"
              />

            </View>


            <View
              style={
                styles.overviewText
              }
            >

              <Text
                style={
                  styles.overviewTitle
                }
              >
                Workers
              </Text>


              <Text
                style={
                  styles.overviewSubtitle
                }
              >
                Active staff available
              </Text>

            </View>


            <Text
              style={
                styles.overviewValue
              }
            >
              {workers.length}
            </Text>

          </View>


          <View
            style={
              styles.divider
            }
          />


          {/* IN PROGRESS */}

          <View
            style={
              styles.overviewRow
            }
          >

            <View
              style={
                styles.overviewIcon
              }
            >

              <MaterialIcons
                name="build-circle"
                size={20}
                color="#EA580C"
              />

            </View>


            <View
              style={
                styles.overviewText
              }
            >

              <Text
                style={
                  styles.overviewTitle
                }
              >
                In Progress
              </Text>


              <Text
                style={
                  styles.overviewSubtitle
                }
              >
                Jobs currently being serviced
              </Text>

            </View>


            <Text
              style={
                styles.overviewValue
              }
            >
              {inProgressJobs}
            </Text>

          </View>


          <View
            style={
              styles.divider
            }
          />


          {/* LOW STOCK */}

          <View
            style={
              styles.overviewRow
            }
          >

            <View
              style={[
                styles.overviewIcon,
                {
                  backgroundColor:
                    "#FEF2F2"
                }
              ]}
            >

              <Ionicons
                name="warning-outline"
                size={20}
                color="#DC2626"
              />

            </View>


            <View
              style={
                styles.overviewText
              }
            >

              <Text
                style={
                  styles.overviewTitle
                }
              >
                Low Stock
              </Text>


              <Text
                style={
                  styles.overviewSubtitle
                }
              >
                Spare parts need attention
              </Text>

            </View>


            <Text
              style={[
                styles.overviewValue,
                {
                  color:
                    lowStockItems.length > 0
                      ? "#DC2626"
                      : "#16A34A"
                }
              ]}
            >
              {lowStockItems.length}
            </Text>

          </View>


          <View
            style={
              styles.divider
            }
          />


          {/* PAYMENTS */}

          <View
            style={
              styles.overviewRow
            }
          >

            <View
              style={[
                styles.overviewIcon,
                {
                  backgroundColor:
                    "#FFF7ED"
                }
              ]}
            >

              <MaterialIcons
                name="payments"
                size={20}
                color="#EA580C"
              />

            </View>


            <View
              style={
                styles.overviewText
              }
            >

              <Text
                style={
                  styles.overviewTitle
                }
              >
                Pending Payments
              </Text>


              <Text
                style={
                  styles.overviewSubtitle
                }
              >
                Demo data for now
              </Text>

            </View>


            <Text
              style={[
                styles.overviewValue,
                {
                  color:
                    "#EA580C"
                }
              ]}
            >
              {pendingPayments}
            </Text>

          </View>

        </View>


        {/* ==========================
            RECENT JOBS
        ========================== */}

        <View
          style={
            styles.sectionRow
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Recent Jobs
          </Text>


          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                "Jobs"
              )
            }
          >

            <Text
              style={
                styles.viewAll
              }
            >
              View All
            </Text>

          </TouchableOpacity>

        </View>


        {recentJobs.length === 0 ? (

          <View
            style={
              styles.emptyCard
            }
          >

            <MaterialIcons
              name="assignment"
              size={36}
              color="#9CA3AF"
            />


            <Text
              style={
                styles.emptyTitle
              }
            >
              No jobs yet
            </Text>


            <Text
              style={
                styles.emptyText
              }
            >
              Create your first job to see
              it here.
            </Text>


            <TouchableOpacity
              style={
                styles.emptyButton
              }
              onPress={() =>
                navigation.navigate(
                  "CreateJob"
                )
              }
            >

              <Text
                style={
                  styles.emptyButtonText
                }
              >
                Create Job
              </Text>

            </TouchableOpacity>

          </View>

        ) : (

          recentJobs.map(
            (
              item: any
            ) => {

              const total =
                getJobTotal(
                  item
                )


              return (

                <TouchableOpacity
                  key={item.id}
                  style={
                    styles.jobCard
                  }
                  onPress={() =>
                    navigation.navigate(
                      "JobDetail",
                      {
                        job: item
                      }
                    )
                  }
                  activeOpacity={0.7}
                >

                  <View
                    style={
                      styles.jobTop
                    }
                  >

                    <View
                      style={{
                        flex: 1
                      }}
                    >

                      <View
                        style={
                          styles.vehicleRow
                        }
                      >

                        <View
                          style={
                            styles.vehicleIcon
                          }
                        >

                          <Ionicons
                            name={
                              item.vehicleType ===
                              "2 Wheeler"
                                ? "bicycle"
                                : "car-sport"
                            }
                            size={16}
                            color="#2563EB"
                          />

                        </View>


                        <View
                          style={{
                            flex: 1
                          }}
                        >

                          <Text
                            style={
                              styles.vehicle
                            }
                            numberOfLines={1}
                          >
                            {
                              item.vehicleNumber ||
                              item.vehicle?.number ||
                              "Vehicle"
                            }
                          </Text>


                          <Text
                            style={
                              styles.vehicleModel
                            }
                            numberOfLines={1}
                          >
                            {
                              item.vehicleModel ||
                              item.vehicle?.model ||
                              "Vehicle details"
                            }
                          </Text>

                        </View>

                      </View>


                      <Text
                        style={
                          styles.customer
                        }
                        numberOfLines={1}
                      >
                        {
                          item.customerName ||
                          item.customer?.name ||
                          item.customer ||
                          "Customer"
                        }
                      </Text>

                    </View>


                    <Text
                      style={
                        styles.amount
                      }
                    >
                      ₹
                      {Number(total)
                        .toLocaleString(
                          "en-IN"
                        )}
                    </Text>

                  </View>


                  <View
                    style={
                      styles.jobBottom
                    }
                  >

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            getStatusColor(
                              item.status
                            )
                        }
                      ]}
                    >

                      <Text
                        style={
                          styles.statusText
                        }
                      >
                        {
                          getStatusText(
                            item.status
                          )
                        }
                      </Text>

                    </View>


                    <Text
                      style={
                        styles.servicesText
                      }
                    >
                      {
                        Array.isArray(
                          item.services
                        )

                          ? `${item.services.length} services`

                          : "Service"
                      }
                    </Text>

                  </View>

                </TouchableOpacity>

              )

            }
          )

        )}


        <View
          style={{
            height: 100
          }}
        />

      </ScrollView>

    </View>

  )

}


// ==================================
// STYLES
// ==================================

const styles =
  StyleSheet.create({

    screen: {
      flex: 1,
      backgroundColor:
        "#F3F4F6"
    },

    container: {
      flex: 1,
      backgroundColor:
        "#F3F4F6",
      paddingHorizontal: 18,
      paddingTop: 18
    },

    headerRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginBottom: 22
    },

    headerInfo: {
      flex: 1,
      paddingRight: 12
    },

    greeting: {
      color: "#6B7280",
      fontSize: 14
    },

    header: {
      fontSize: 30,
      fontWeight: "bold",
      color: "#111827",
      marginTop: 4
    },

    subHeader: {
      color: "#6B7280",
      marginTop: 3
    },

    roleText: {
      marginTop: 6,
      color: "#2563EB",
      fontWeight: "700",
      fontSize: 13
    },


    // ==================================
    // PLAN HEADER
    // ==================================

    planHeaderContainer: {
      alignItems: "center",
      justifyContent: "center",
      minWidth: 78,
      marginLeft: 8
    },

    planRing: {
      width: 62,
      height: 62,
      borderRadius: 31,
      borderWidth: 3,
      justifyContent: "center",
      alignItems: "center"
    },

    planRingNumber: {
      fontSize: 16,
      fontWeight: "bold"
    },

    planRingLabel: {
      fontSize: 8,
      color: "#6B7280",
      fontWeight: "700",
      marginTop: 1
    },

    planNameHeader: {
      marginTop: 4,
      fontSize: 11,
      fontWeight: "800",
      maxWidth: 78,
      textAlign: "center"
    },

    planUsageHeader: {
      marginTop: 1,
      fontSize: 9,
      color: "#6B7280",
      fontWeight: "600",
      textAlign: "center"
    },


    // ==================================
    // STATS
    // ==================================

    statsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent:
        "space-between"
    },

    card: {
      width: "48%",
      backgroundColor: "white",
      borderRadius: 20,
      padding: 18,
      marginBottom: 15
    },

    iconBox: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12
    },

    cardValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#111827"
    },

    cardTitle: {
      color: "#6B7280",
      marginTop: 5,
      fontSize: 13
    },


    // ==================================
    // SECTIONS
    // ==================================

    sectionTitle: {
      fontSize: 19,
      fontWeight: "bold",
      color: "#111827",
      marginBottom: 14,
      marginTop: 8
    },


    // ==================================
    // QUICK ACTIONS
    // ==================================

    quickActions: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      marginBottom: 12
    },

    actionBtn: {
      width: "48%",
      backgroundColor: "white",
      borderRadius: 18,
      paddingVertical: 22,
      alignItems: "center"
    },

    actionText: {
      marginTop: 10,
      fontWeight: "600",
      color: "#374151"
    },


    // ==================================
    // BUSINESS OVERVIEW
    // ==================================

    overviewCard: {
      backgroundColor: "white",
      borderRadius: 18,
      paddingHorizontal: 16,
      marginBottom: 18
    },

    overviewRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14
    },

    overviewIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12
    },

    overviewText: {
      flex: 1
    },

    overviewTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: "#111827"
    },

    overviewSubtitle: {
      fontSize: 12,
      color: "#6B7280",
      marginTop: 3
    },

    overviewValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#111827"
    },

    divider: {
      height: 1,
      backgroundColor:
        "#E5E7EB"
    },


    // ==================================
    // RECENT JOBS
    // ==================================

    sectionRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center"
    },

    viewAll: {
      color: "#2563EB",
      fontWeight: "600"
    },

    jobCard: {
      backgroundColor: "white",
      borderRadius: 20,
      padding: 18,
      marginBottom: 14
    },

    jobTop: {
      flexDirection: "row",
      justifyContent:
        "space-between"
    },

    vehicleRow: {
      flexDirection: "row",
      alignItems: "center"
    },

    vehicleIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12
    },

    vehicle: {
      fontSize: 17,
      fontWeight: "bold",
      color: "#111827"
    },

    vehicleModel: {
      color: "#6B7280",
      marginTop: 2
    },

    customer: {
      marginTop: 14,
      color: "#374151",
      fontWeight: "500"
    },

    amount: {
      fontWeight: "bold",
      color: "#16A34A",
      fontSize: 17,
      marginLeft: 8
    },

    jobBottom: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginTop: 18
    },

    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 30
    },

    statusText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 11
    },

    servicesText: {
      color: "#6B7280",
      fontWeight: "500"
    },


    // ==================================
    // EMPTY STATE
    // ==================================

    emptyCard: {
      backgroundColor: "white",
      borderRadius: 20,
      padding: 28,
      alignItems: "center",
      marginBottom: 20
    },

    emptyTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: "#111827",
      marginTop: 10
    },

    emptyText: {
      fontSize: 13,
      color: "#6B7280",
      textAlign: "center",
      marginTop: 5,
      marginBottom: 16
    },

    emptyButton: {
      backgroundColor: "#2563EB",
      paddingHorizontal: 20,
      paddingVertical: 11,
      borderRadius: 12
    },

    emptyButtonText: {
      color: "white",
      fontWeight: "700"
    }

  })
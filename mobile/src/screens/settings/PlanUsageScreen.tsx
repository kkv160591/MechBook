import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native"

import {
  useEffect,
  useState
} from "react"

import {
  MaterialIcons
} from "@expo/vector-icons"

import {
  getPlanUsage,
  changePlan,
  buyBooster
} from "../../services/subscriptionService"


type BillingCycle =
  | "monthly"
  | "annual"

type PlanKey =
  | "free"
  | "basic"
  | "growth"
  | "corporate"


type PlanUsage = {
  planName?: string
  planCode?: string
  billingCycle?: string

  jobsUsed?: number
  jobsLimit?: number | string

  renewalDate?: string
  daysRemaining?: number
}


type Plan = {
  key: PlanKey
  name: string
  description: string
  monthly: number
  annual: number
  jobs: number | string
  workers: number | string
  popular: boolean
}


type Booster = {
  code: string
  title: string
  jobs: number
  price: number
  cost: string
  bestFor: string
}


/*
 * PLAN CONFIGURATION
 *
 * Keep this here for now.
 *
 * Later, if you want the backend/DynamoDB
 * to control pricing and features, move this
 * into your settings/plans configuration.
 */

const PLANS: Record<PlanKey, Plan> = {

  free: {
    key: "free",
    name: "Free",
    description: "Perfect for getting started",
    monthly: 0,
    annual: 0,
    jobs: 20,
    workers: 1,
    popular: false
  },

  basic: {
    key: "basic",
    name: "Basic",
    description: "For growing garages",
    monthly: 299,
    annual: 199,
    jobs: 100,
    workers: 3,
    popular: false
  },

  growth: {
    key: "growth",
    name: "Growth",
    description: "For busy professional garages",
    monthly: 549,
    annual: 399,
    jobs: 250,
    workers: 6,
    popular: true
  },

  corporate: {
    key: "corporate",
    name: "Corporate",
    description: "For large garage operations",
    monthly: 899,
    annual: 629,
    jobs: "Unlimited",
    workers: "Unlimited",
    popular: false
  }

}


/*
 * FEATURE COMPARISON
 */

const FEATURES = [

  {
    name: "Jobs per month",
    free: "20",
    basic: "100",
    growth: "250",
    corporate: "Unlimited"
  },

  {
    name: "Workers / Logins",
    free: "1 Owner",
    basic: "3",
    growth: "6",
    corporate: "Unlimited"
  },

  {
    name: "Job Card & History",
    free: "✓",
    basic: "✓",
    growth: "✓",
    corporate: "✓"
  },

  {
    name: "Customer Database",
    free: "✓",
    basic: "✓",
    growth: "✓",
    corporate: "✓"
  },

  {
    name: "Inventory Management",
    free: "Basic",
    basic: "Full",
    growth: "Full",
    corporate: "Full"
  },

  {
    name: "GST Invoicing",
    free: "—",
    basic: "✓",
    growth: "✓",
    corporate: "✓"
  },

  {
    name: "PDF Invoice Share",
    free: "—",
    basic: "✓",
    growth: "✓",
    corporate: "✓"
  },

  {
    name: "Reports & Analytics",
    free: "Basic",
    basic: "Standard",
    growth: "Advanced",
    corporate: "Advanced"
  },

  {
    name: "Data Backup",
    free: "Manual",
    basic: "Daily",
    growth: "Daily",
    corporate: "Real-time"
  },

  {
    name: "Priority Support",
    free: "—",
    basic: "—",
    growth: "✓",
    corporate: "✓"
  }

]


/*
 * BOOSTERS
 *
 * The "code" is what your backend receives.
 */

const BOOSTERS: Booster[] = [

  {
    code: "MINI_BOOST",
    title: "Mini Boost",
    jobs: 20,
    price: 49,
    cost: "₹2.45/job",
    bestFor: "Free plan overflow"
  },

  {
    code: "STANDARD_BOOST",
    title: "Standard Boost",
    jobs: 50,
    price: 99,
    cost: "₹1.98/job",
    bestFor: "Basic plan users"
  },

  {
    code: "BIG_BOOST",
    title: "Big Boost",
    jobs: 150,
    price: 249,
    cost: "₹1.66/job",
    bestFor: "Growth plan users"
  }

]


export default function PlanUsageScreen() {

  const [plan, setPlan] =
    useState<PlanUsage | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [changingPlan, setChangingPlan] =
    useState(false)

  const [buyingBooster, setBuyingBooster] =
    useState(false)

  const [billingCycle, setBillingCycle] =
    useState<BillingCycle>("monthly")

  const [showFeatures, setShowFeatures] =
    useState(false)


  /*
   * LOAD CURRENT PLAN
   */

  useEffect(() => {

    loadPlan()

  }, [])


  const loadPlan = async () => {

    try {

      setLoading(true)

      const data =
        await getPlanUsage()

      console.log(
        "Subscription:",
        data
      )

      setPlan(data)

      /*
       * If backend already provides billingCycle,
       * synchronize the UI with it.
       */

      if (
        data?.billingCycle
      ) {

        const backendCycle =
          data.billingCycle.toLowerCase()

        if (
          backendCycle === "monthly" ||
          backendCycle === "annual"
        ) {

          setBillingCycle(
            backendCycle as BillingCycle
          )

        }

      }

    }

    catch (error) {

      console.log(
        "Failed to load subscription:",
        error
      )

      /*
       * DEVELOPMENT FALLBACK
       *
       * This allows the screen to remain usable
       * while your backend subscription endpoint
       * is still being developed.
       */

      setPlan({

        planName: "Free",
        planCode: "free",

        jobsUsed: 18,
        jobsLimit: 20,

        renewalDate: "31 Aug 2026",
        daysRemaining: 18

      })

    }

    finally {

      setLoading(false)

    }

  }


  /*
   * CHANGE PLAN
   *
   * For development your backend can temporarily
   * return success without real payment.
   *
   * Later the same endpoint can be connected
   * to Razorpay/another gateway.
   */

  const handleUpgrade = async (
    selectedPlan: Plan
  ) => {

    const selectedPlanKey =
      selectedPlan.key

    const currentPlanKey =
      (
        plan?.planCode ||
        plan?.planName ||
        "free"
      )
        .toLowerCase()
        .trim() as PlanKey


    if (
      selectedPlanKey ===
      currentPlanKey
    ) {

      return

    }


    const actionText =
      selectedPlanKey === "free"
        ? "Switch to Free"
        : `Upgrade to ${selectedPlan.name}`


    Alert.alert(
      actionText,
      `Continue with ${selectedPlan.name} plan at ₹${
        billingCycle === "monthly"
          ? selectedPlan.monthly
          : selectedPlan.annual
      }/${billingCycle === "monthly" ? "month" : "month"}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },

        {
          text: "Continue",

          onPress: async () => {

            try {

              setChangingPlan(true)

              const result =
                await changePlan(
                  selectedPlanKey,
                  billingCycle === "monthly"
                    ? "MONTHLY"
                    : "ANNUAL"
                )


              console.log(
                "Change plan result:",
                result
              )


              /*
               * DEVELOPMENT PAYMENT SUCCESS
               *
               * At this stage we assume that
               * a successful API response means
               * payment/change was successful.
               */

              Alert.alert(
                "Success",
                `${selectedPlan.name} plan activated successfully.`,
                [
                  {
                    text: "OK",
                    onPress: () => {
                      loadPlan()
                    }
                  }
                ]
              )

            }

            catch (error) {

              console.log(
                "Change plan failed:",
                error
              )

              Alert.alert(
                "Unable to change plan",
                "Something went wrong while changing your subscription. Please try again."
              )

            }

            finally {

              setChangingPlan(false)

            }

          }

        }

      ]
    )

  }


  /*
   * BUY BOOSTER
   */

  const handleBooster = (
    booster: Booster
  ) => {

    Alert.alert(
      booster.title,
      `Add ${booster.jobs} jobs for ₹${booster.price}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },

        {
          text: "Continue",

          onPress: async () => {

            try {

              setBuyingBooster(true)

              const result =
                await buyBooster(
                  booster.code
                )


              console.log(
                "Booster result:",
                result
              )


              /*
               * DEVELOPMENT PAYMENT SUCCESS
               */

              Alert.alert(
                "Success",
                `${booster.jobs} additional jobs have been added to your account.`,
                [
                  {
                    text: "OK",
                    onPress: () => {
                      loadPlan()
                    }
                  }
                ]
              )

            }

            catch (error) {

              console.log(
                "Booster purchase failed:",
                error
              )

              Alert.alert(
                "Unable to purchase booster",
                "Something went wrong while purchasing the booster. Please try again."
              )

            }

            finally {

              setBuyingBooster(false)

            }

          }

        }

      ]
    )

  }


  /*
   * LOADING
   */

  if (loading) {

    return (

      <View style={styles.loadingContainer}>

        <MaterialIcons
          name="workspace-premium"
          size={40}
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading subscription...
        </Text>

      </View>

    )

  }


  /*
   * CURRENT PLAN
   */

  const currentPlanName =
    plan?.planName || "Free"


  const currentPlanKey =
    (
      plan?.planCode ||
      currentPlanName ||
      "free"
    )
      .toLowerCase()
      .trim() as PlanKey


  const safeCurrentPlanKey =
    PLANS[currentPlanKey]
      ? currentPlanKey
      : "free"


  const jobsUsed =
    Number(
      plan?.jobsUsed ?? 0
    )


  const jobsLimit =
    plan?.jobsLimit === "Unlimited"
      ? "Unlimited"
      : Number(
          plan?.jobsLimit ?? 20
        )


  const usagePercentage =
    jobsLimit === "Unlimited"
      ? 0
      : Math.min(
          Math.round(
            (jobsUsed /
              Number(jobsLimit)) *
              100
          ),
          100
        )


  const jobsRemaining =
    jobsLimit === "Unlimited"
      ? "Unlimited"
      : Math.max(
          Number(jobsLimit) -
            jobsUsed,
          0
        )


  const isNearLimit =
    jobsLimit !== "Unlimited" &&
    usagePercentage >= 80


  const isLimitReached =
    jobsLimit !== "Unlimited" &&
    jobsUsed >=
      Number(jobsLimit)


  /*
   * RENDER
   */

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* PAGE HEADER */}

      <View style={styles.pageHeader}>

        <Text style={styles.pageTitle}>
          Plan & Usage
        </Text>

        <Text style={styles.pageSubtitle}>
          Manage your subscription and monthly job usage
        </Text>

      </View>


      {/* CURRENT PLAN */}

      <View style={styles.currentPlanCard}>

        <View style={styles.currentPlanTop}>

          <View style={styles.currentPlanIcon}>

            <MaterialIcons
              name="workspace-premium"
              size={28}
              color="#F59E0B"
            />

          </View>


          <View style={styles.currentPlanInfo}>

            <Text style={styles.currentPlanLabel}>
              CURRENT PLAN
            </Text>

            <Text style={styles.currentPlanName}>
              {currentPlanName}
            </Text>

          </View>


          <View style={styles.activeBadge}>

            <View style={styles.activeDot} />

            <Text style={styles.activeText}>
              ACTIVE
            </Text>

          </View>

        </View>


        <View style={styles.planDivider} />


        <View style={styles.planDetailsRow}>

          <View>

            <Text style={styles.detailLabel}>
              Monthly price
            </Text>

            <Text style={styles.detailValue}>
              ₹
              {
                PLANS[
                  safeCurrentPlanKey
                ]?.monthly ?? 0
              }
              /mo
            </Text>

          </View>


          <View>

            <Text style={styles.detailLabel}>
              Renewal
            </Text>

            <Text style={styles.detailValue}>
              {plan?.renewalDate || "—"}
            </Text>

          </View>


          <View>

            <Text style={styles.detailLabel}>
              Days left
            </Text>

            <Text
              style={[
                styles.detailValue,
                {
                  color:
                    (
                      plan?.daysRemaining ??
                      0
                    ) <= 7
                      ? "#DC2626"
                      : "#16A34A"
                }
              ]}
            >
              {plan?.daysRemaining ?? "—"}
            </Text>

          </View>

        </View>

      </View>


      {/* USAGE */}

      <View style={styles.usageCard}>

        <View style={styles.sectionHeaderRow}>

          <View>

            <Text style={styles.sectionTitle}>
              Jobs this month
            </Text>

            <Text style={styles.sectionSubtitle}>
              Your monthly job card allowance
            </Text>

          </View>


          <View style={styles.usageNumberBox}>

            <Text style={styles.usageNumber}>
              {jobsUsed}
            </Text>

            <Text style={styles.usageLimit}>
              / {jobsLimit}
            </Text>

          </View>

        </View>


        {jobsLimit !== "Unlimited" && (

          <>

            <View style={styles.progressBackground}>

              <View
                style={[
                  styles.progressFill,
                  {
                    width:
                      `${usagePercentage}%`,

                    backgroundColor:
                      isLimitReached
                        ? "#DC2626"
                        : isNearLimit
                        ? "#F59E0B"
                        : "#2563EB"
                  }
                ]}
              />

            </View>


            <View style={styles.usageFooter}>

              <Text style={styles.usagePercentage}>
                {usagePercentage}% used
              </Text>


              <Text
                style={[
                  styles.remainingText,
                  isLimitReached &&
                    styles.remainingDanger
                ]}
              >
                {isLimitReached
                  ? "Monthly limit reached"
                  : `${jobsRemaining} jobs remaining`}
              </Text>

            </View>

          </>

        )}


        {jobsLimit === "Unlimited" && (

          <View style={styles.unlimitedBox}>

            <MaterialIcons
              name="all-inclusive"
              size={20}
              color="#16A34A"
            />

            <Text style={styles.unlimitedText}>
              Unlimited jobs included in your plan
            </Text>

          </View>

        )}

      </View>


      {/* BILLING TOGGLE */}

      <View style={styles.billingSection}>

        <View>

          <Text style={styles.sectionTitle}>
            Choose your plan
          </Text>

          <Text style={styles.sectionSubtitle}>
            Upgrade whenever your garage grows
          </Text>

        </View>


        <View style={styles.billingToggle}>

          <TouchableOpacity
            disabled={changingPlan}
            style={[
              styles.billingButton,
              billingCycle === "monthly" &&
                styles.billingButtonActive
            ]}
            onPress={() =>
              setBillingCycle("monthly")
            }
          >

            <Text
              style={[
                styles.billingText,
                billingCycle === "monthly" &&
                  styles.billingTextActive
              ]}
            >
              Monthly
            </Text>

          </TouchableOpacity>


          <TouchableOpacity
            disabled={changingPlan}
            style={[
              styles.billingButton,
              billingCycle === "annual" &&
                styles.billingButtonActive
            ]}
            onPress={() =>
              setBillingCycle("annual")
            }
          >

            <Text
              style={[
                styles.billingText,
                billingCycle === "annual" &&
                  styles.billingTextActive
              ]}
            >
              Annual
            </Text>

            <View style={styles.saveBadge}>

              <Text style={styles.saveBadgeText}>
                SAVE
              </Text>

            </View>

          </TouchableOpacity>

        </View>

      </View>


      {/* PLANS */}

      {Object.values(PLANS).map(
        item => {

          const isCurrent =
            item.key ===
            safeCurrentPlanKey


          const price =
            billingCycle === "monthly"
              ? item.monthly
              : item.annual


          return (

            <View
              key={item.key}
              style={[
                styles.planOption,
                item.popular &&
                  styles.popularPlan,
                isCurrent &&
                  styles.currentPlanOption
              ]}
            >

              {item.popular && (

                <View style={styles.popularBadge}>

                  <Text style={styles.popularBadgeText}>
                    MOST POPULAR
                  </Text>

                </View>

              )}


              <View style={styles.planOptionHeader}>

                <View>

                  <Text style={styles.planOptionName}>
                    {item.name}
                  </Text>

                  <Text style={styles.planDescription}>
                    {item.description}
                  </Text>

                </View>


                {isCurrent && (

                  <View style={styles.selectedBadge}>

                    <MaterialIcons
                      name="check-circle"
                      size={20}
                      color="#16A34A"
                    />

                    <Text style={styles.selectedText}>
                      Current
                    </Text>

                  </View>

                )}

              </View>


              <View style={styles.priceRow}>

                <Text style={styles.currency}>
                  ₹
                </Text>

                <Text style={styles.price}>
                  {price}
                </Text>

                <Text style={styles.pricePeriod}>
                  /month
                </Text>

              </View>


              {billingCycle === "annual" &&
                price > 0 && (

                <Text style={styles.annualNote}>
                  Billed annually
                </Text>

              )}


              <View style={styles.planSummary}>

                <View style={styles.planSummaryItem}>

                  <MaterialIcons
                    name="work-outline"
                    size={18}
                    color="#2563EB"
                  />

                  <Text style={styles.summaryText}>
                    {item.jobs} jobs
                  </Text>

                </View>


                <View style={styles.planSummaryItem}>

                  <MaterialIcons
                    name="people-outline"
                    size={18}
                    color="#2563EB"
                  />

                  <Text style={styles.summaryText}>
                    {item.workers} workers
                  </Text>

                </View>

              </View>


              {!isCurrent && (

                <TouchableOpacity
                  disabled={changingPlan}
                  style={[
                    styles.planButton,
                    item.popular &&
                      styles.planButtonPopular,
                    changingPlan &&
                      styles.disabledButton
                  ]}
                  onPress={() =>
                    handleUpgrade(item)
                  }
                >

                  <Text
                    style={[
                      styles.planButtonText,
                      item.popular &&
                        styles.planButtonTextPopular
                    ]}
                  >
                    {changingPlan
                      ? "Processing..."
                      : item.key === "free"
                      ? "Switch to Free"
                      : "Upgrade to " + item.name}
                  </Text>

                  {!changingPlan && (

                    <MaterialIcons
                      name="arrow-forward"
                      size={19}
                      color={
                        item.popular
                          ? "#2563EB"
                          : "white"
                      }
                    />

                  )}

                </TouchableOpacity>

              )}

            </View>

          )

        }
      )}


      {/* FEATURE COMPARISON */}

      <TouchableOpacity
        style={styles.featureToggle}
        onPress={() =>
          setShowFeatures(
            !showFeatures
          )
        }
      >

        <View style={styles.featureToggleLeft}>

          <MaterialIcons
            name="compare"
            size={22}
            color="#2563EB"
          />

          <View>

            <Text style={styles.featureToggleTitle}>
              Compare all features
            </Text>

            <Text style={styles.featureToggleSubtitle}>
              See what is included in each plan
            </Text>

          </View>

        </View>


        <MaterialIcons
          name={
            showFeatures
              ? "keyboard-arrow-up"
              : "keyboard-arrow-down"
          }
          size={25}
          color="#6B7280"
        />

      </TouchableOpacity>


      {showFeatures && (

        <View style={styles.featureCard}>

          {FEATURES.map(
            (feature, index) => (

              <View
                key={feature.name}
                style={[
                  styles.featureRow,
                  index !== 0 &&
                    styles.featureBorder
                ]}
              >

                <Text style={styles.featureName}>
                  {feature.name}
                </Text>

                <Text style={styles.featureValue}>
                  {feature[
                    safeCurrentPlanKey
                  ] as string}
                </Text>

              </View>

            )
          )}

        </View>

      )}


      {/* BOOSTERS */}

      <View style={styles.boosterSectionHeader}>

        <Text style={styles.sectionTitle}>
          Need extra jobs?
        </Text>

        <Text style={styles.sectionSubtitle}>
          One-time job top-ups
        </Text>

      </View>


      <View style={styles.boosterInfo}>

        <MaterialIcons
          name="info-outline"
          size={19}
          color="#2563EB"
        />

        <Text style={styles.boosterInfoText}>
          Booster jobs are valid only for the current
          billing month and do not carry over.
        </Text>

      </View>


      {BOOSTERS.map(
        booster => (

          <View
            key={booster.code}
            style={styles.boosterCard}
          >

            <View style={styles.boosterIcon}>

              <MaterialIcons
                name="add-task"
                size={22}
                color="#2563EB"
              />

            </View>


            <View style={styles.boosterInfoColumn}>

              <Text style={styles.boosterTitle}>
                {booster.title}
              </Text>

              <Text style={styles.boosterJobs}>
                +{booster.jobs} jobs
              </Text>

              <Text style={styles.boosterBestFor}>
                Best for: {booster.bestFor}
              </Text>

            </View>


            <View style={styles.boosterRight}>

              <Text style={styles.boosterPrice}>
                ₹{booster.price}
              </Text>

              <Text style={styles.boosterCost}>
                {booster.cost}
              </Text>


              <TouchableOpacity
                disabled={buyingBooster}
                style={[
                  styles.boosterBuyButton,
                  buyingBooster &&
                    styles.disabledButton
                ]}
                onPress={() =>
                  handleBooster(booster)
                }
              >

                <Text style={styles.boosterBuyText}>
                  {buyingBooster
                    ? "..."
                    : "Buy"}
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        )
      )}


      {/* DEVELOPMENT PAYMENT NOTICE */}

      <View style={styles.developmentNotice}>

        <MaterialIcons
          name="science"
          size={17}
          color="#2563EB"
        />

        <Text style={styles.developmentNoticeText}>
          Development mode: subscription purchases are
          currently treated as successful without a real
          payment gateway.
        </Text>

      </View>


      {/* FOOTER */}

      <View style={styles.footer}>

        <MaterialIcons
          name="lock-outline"
          size={16}
          color="#9CA3AF"
        />

        <Text style={styles.footerText}>
          Payment gateway will be connected later.
        </Text>

      </View>


      <View style={{ height: 50 }} />

    </ScrollView>

  )

}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6"
  },

  loadingText: {
    marginTop: 12,
    color: "#6B7280"
  },

  pageHeader: {
    marginBottom: 18
  },

  pageTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827"
  },

  pageSubtitle: {
    color: "#6B7280",
    marginTop: 5,
    lineHeight: 20
  },

  currentPlanCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18
  },

  currentPlanTop: {
    flexDirection: "row",
    alignItems: "center"
  },

  currentPlanIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#1F2937",
    alignItems: "center",
    justifyContent: "center"
  },

  currentPlanInfo: {
    flex: 1,
    marginLeft: 13
  },

  currentPlanLabel: {
    color: "#9CA3AF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1
  },

  currentPlanName: {
    color: "white",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 2
  },

  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#064E3B",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#34D399",
    marginRight: 5
  },

  activeText: {
    color: "#A7F3D0",
    fontSize: 10,
    fontWeight: "800"
  },

  planDivider: {
    height: 1,
    backgroundColor: "#374151",
    marginVertical: 18
  },

  planDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  detailLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    marginBottom: 5
  },

  detailValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "700"
  },

  usageCard: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 19,
    marginBottom: 24
  },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827"
  },

  sectionSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 4
  },

  usageNumberBox: {
    flexDirection: "row",
    alignItems: "baseline"
  },

  usageNumber: {
    fontSize: 25,
    fontWeight: "800",
    color: "#111827"
  },

  usageLimit: {
    color: "#6B7280",
    fontSize: 13,
    marginLeft: 2
  },

  progressBackground: {
    height: 11,
    backgroundColor: "#E5E7EB",
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 18
  },

  progressFill: {
    height: "100%",
    borderRadius: 20
  },

  usageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 9
  },

  usagePercentage: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600"
  },

  remainingText: {
    color: "#16A34A",
    fontSize: 12,
    fontWeight: "700"
  },

  remainingDanger: {
    color: "#DC2626"
  },

  unlimitedBox: {
    marginTop: 17,
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center"
  },

  unlimitedText: {
    marginLeft: 8,
    color: "#166534",
    fontWeight: "600",
    fontSize: 13
  },

  billingSection: {
    marginBottom: 14
  },

  billingToggle: {
    marginTop: 15,
    backgroundColor: "#E5E7EB",
    borderRadius: 14,
    padding: 4,
    flexDirection: "row"
  },

  billingButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row"
  },

  billingButtonActive: {
    backgroundColor: "white",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2
    }
  },

  billingText: {
    color: "#6B7280",
    fontWeight: "700",
    fontSize: 13
  },

  billingTextActive: {
    color: "#111827"
  },

  saveBadge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 5
  },

  saveBadgeText: {
    color: "#15803D",
    fontSize: 8,
    fontWeight: "800"
  },

  planOption: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },

  popularPlan: {
    borderWidth: 2,
    borderColor: "#2563EB"
  },

  currentPlanOption: {
    backgroundColor: "#F8FAFC"
  },

  popularBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#2563EB",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    marginBottom: 12
  },

  popularBadgeText: {
    color: "white",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.4
  },

  planOptionHeader: {
    flexDirection: "row",
    alignItems: "flex-start"
  },

  planOptionName: {
    fontSize: 21,
    fontWeight: "800",
    color: "#111827"
  },

  planDescription: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 3
  },

  selectedBadge: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center"
  },

  selectedText: {
    color: "#16A34A",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 17
  },

  currency: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827"
  },

  price: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
    marginLeft: 2
  },

  pricePeriod: {
    color: "#6B7280",
    fontSize: 12,
    marginLeft: 4
  },

  annualNote: {
    color: "#16A34A",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2
  },

  planSummary: {
    flexDirection: "row",
    marginTop: 17,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6"
  },

  planSummaryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 25
  },

  summaryText: {
    marginLeft: 7,
    color: "#374151",
    fontSize: 13,
    fontWeight: "600"
  },

  planButton: {
    marginTop: 17,
    backgroundColor: "#111827",
    borderRadius: 13,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },

  planButtonPopular: {
    backgroundColor: "#EFF6FF"
  },

  planButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
    marginRight: 7
  },

  planButtonTextPopular: {
    color: "#2563EB"
  },

  disabledButton: {
    opacity: 0.6
  },

  featureToggle: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    marginTop: 5,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  featureToggleLeft: {
    flexDirection: "row",
    alignItems: "center"
  },

  featureToggleTitle: {
    color: "#111827",
    fontWeight: "700",
    marginLeft: 11
  },

  featureToggleSubtitle: {
    color: "#6B7280",
    fontSize: 11,
    marginLeft: 11,
    marginTop: 3
  },

  featureCard: {
    backgroundColor: "white",
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 22
  },

  featureRow: {
    minHeight: 51,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  featureBorder: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6"
  },

  featureName: {
    flex: 1,
    color: "#374151",
    fontSize: 13
  },

  featureValue: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 12,
    textAlign: "right",
    marginLeft: 15
  },

  boosterSectionHeader: {
    marginTop: 4,
    marginBottom: 14
  },

  boosterInfo: {
    backgroundColor: "#EFF6FF",
    borderRadius: 13,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12
  },

  boosterInfoText: {
    flex: 1,
    marginLeft: 8,
    color: "#1E40AF",
    fontSize: 11,
    lineHeight: 17
  },

  boosterCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center"
  },

  boosterIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center"
  },

  boosterInfoColumn: {
    flex: 1,
    marginLeft: 11
  },

  boosterTitle: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "800"
  },

  boosterJobs: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 12,
    marginTop: 2
  },

  boosterBestFor: {
    color: "#9CA3AF",
    fontSize: 10,
    marginTop: 3
  },

  boosterRight: {
    alignItems: "flex-end"
  },

  boosterPrice: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800"
  },

  boosterCost: {
    color: "#9CA3AF",
    fontSize: 9,
    marginTop: 1
  },

  boosterBuyButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 9,
    marginTop: 6
  },

  boosterBuyText: {
    color: "white",
    fontSize: 11,
    fontWeight: "800"
  },

  developmentNotice: {
    backgroundColor: "#EFF6FF",
    borderRadius: 13,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12
  },

  developmentNoticeText: {
    flex: 1,
    marginLeft: 8,
    color: "#1E40AF",
    fontSize: 11,
    lineHeight: 17
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18
  },

  footerText: {
    color: "#9CA3AF",
    fontSize: 10,
    marginLeft: 5
  }

})
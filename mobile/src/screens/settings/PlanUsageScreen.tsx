import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react"

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform
} from "react-native"

import { MaterialIcons } from "@expo/vector-icons"
import { useTranslation } from "../../context/LanguageContext"

import {
  openRazorpayCheckout
} from "../../services/razorpayCheckout.web"

import {
  verifySubscriptionPayment,
  verifyBoosterPayment,
  getPlanUsage,
  changePlan,
  buyBooster,
  BillingCycle,
  PlanUsageResponse
} from "../../services/subscriptionService"

type PlanKey =
  | "free"
  | "basic"
  | "growth"
  | "corporate"

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
] as const

/*
 * HELPER UTILITIES
 */
const boosterTitle = (code: string) => {
  switch (code) {
    case "MINI_BOOST":
      return "Mini Boost"
    case "STANDARD_BOOST":
      return "Standard Boost"
    case "BIG_BOOST":
      return "Big Boost"
    default:
      return code
  }
}

const boosterBestFor = (code: string) => {
  switch (code) {
    case "MINI_BOOST":
      return "Free plan overflow"
    case "STANDARD_BOOST":
      return "Basic plan users"
    case "BIG_BOOST":
      return "Growth plan users"
    default:
      return "Additional jobs"
  }
}

const boosterCost = (jobs: number, price: number) => {
  if (!jobs) return ""
  return `₹${(price / jobs).toFixed(2)}/job`
}

const normalizePlanKey = (value?: string | null): PlanKey => {
  const normalized = String(value ?? "").toLowerCase().trim()
  if (
    normalized === "free" ||
    normalized === "basic" ||
    normalized === "growth" ||
    normalized === "corporate"
  ) {
    return normalized
  }
  return "free"
}

const normalizeBillingCycle = (value?: string | null): BillingCycle | null => {
  const normalized = String(value ?? "").toLowerCase().trim()
  if (normalized === "monthly") return "monthly"
  if (normalized === "annual" || normalized === "yearly") return "annual"
  return null
}

export default function PlanUsageScreen() {
  const { t } = useTranslation()

  const [plan, setPlan] = useState<PlanUsageResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [changingPlan, setChangingPlan] = useState(false)
  const [buyingBooster, setBuyingBooster] = useState(false)
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly")
  const [showFeatures, setShowFeatures] = useState(false)
  const [loadError, setLoadError] = useState(false)

  /*
   * LOAD CURRENT PLAN
   */
  const loadPlan = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setLoadError(false)

      const data = await getPlanUsage()
      setPlan(data)

      const backendCycle = normalizeBillingCycle(data?.billingCycle)
      if (backendCycle) {
        setBillingCycle(backendCycle)
      }
    } catch (error) {
      console.log("Failed to load subscription:", error)
      setLoadError(true)
      setPlan(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadPlan()
  }, [loadPlan])

  /*
   * CURRENT PLAN DATA
   */
  const currentPlanKey = useMemo(
    () => normalizePlanKey(plan?.planCode || plan?.planName),
    [plan?.planCode, plan?.planName]
  )

  const currentPlan = PLANS[currentPlanKey]
  const currentPlanName = plan?.planName || currentPlan.name
  const currentBillingCycle = normalizeBillingCycle(plan?.billingCycle) || billingCycle

  const getDaysRemaining = (renewalDate?: string | null): number | null => {
    if (!renewalDate) return null
    const renewalTime = new Date(renewalDate).getTime()
    if (Number.isNaN(renewalTime)) return null
    const difference = renewalTime - Date.now()
    if (difference <= 0) return 0
    return Math.ceil(difference / (1000 * 60 * 60 * 24))
  }

  const formatRenewalDate = (date?: string | null) => {
    if (!date) return "—"
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return "—"
    return parsed.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  const daysRemaining = getDaysRemaining(plan?.renewalDate)

  /*
   * USAGE DATA
   */
  const jobsUsed = Math.max(Number(plan?.jobsUsed ?? 0), 0)
  const normalizedJobLimit =
    plan?.jobsLimit ?? (plan as any)?.jobLimit ?? currentPlan.jobs

  const jobsLimit =
    normalizedJobLimit === "Unlimited" ||
    String(normalizedJobLimit).toLowerCase() === "unlimited" ||
    Number(normalizedJobLimit) === -1
      ? "Unlimited"
      : Math.max(Number(normalizedJobLimit), 0)

  const totalJobsAvailable =
    jobsLimit === "Unlimited"
      ? "Unlimited"
      : Math.max(Number(plan?.totalJobsAvailable ?? jobsLimit), 0)

  const usagePercentage =
    totalJobsAvailable === "Unlimited"
      ? 0
      : Math.min(
          Math.round((jobsUsed / Number(totalJobsAvailable)) * 100),
          100
        )

  const jobsRemaining =
    totalJobsAvailable === "Unlimited"
      ? "Unlimited"
      : Math.max(
          Number(plan?.jobsRemaining ?? Number(totalJobsAvailable) - jobsUsed),
          0
        )

  const isNearLimit = jobsLimit !== "Unlimited" && usagePercentage >= 80
  const isLimitReached = jobsLimit !== "Unlimited" && jobsUsed >= Number(jobsLimit)

  /*
   * PRICING CALCULATIONS
   */
  const getMonthlyPrice = (selectedPlan: Plan) => selectedPlan.monthly
  const getAnnualMonthlyEquivalent = (selectedPlan: Plan) => selectedPlan.annual
  const getAnnualPrice = (selectedPlan: Plan) => selectedPlan.annual * 12

  const handleBillingCycleChange = (cycle: BillingCycle) => {
    if (changingPlan || buyingBooster) return
    setBillingCycle(cycle)
  }

  /*
   * UPGRADE PLAN
   */
  const handleUpgrade = async (selectedPlan: Plan) => {
    if (changingPlan || buyingBooster || selectedPlan.key === currentPlanKey) return

    const monthlyPrice = getMonthlyPrice(selectedPlan)
    const annualMonthlyEquivalent = getAnnualMonthlyEquivalent(selectedPlan)
    const annualPrice = getAnnualPrice(selectedPlan)

    const confirmationMessage =
      selectedPlan.key === "free"
        ? t("plan.confirmFree") || "Your account will be moved to the Free plan."
        : billingCycle === "monthly"
        ? `Continue with ${selectedPlan.name} at ₹${monthlyPrice}/month?`
        : `Continue with ${selectedPlan.name} for ₹${annualPrice}/year (₹${annualMonthlyEquivalent}/month equivalent)?`

    const continueUpgrade = async () => {
      try {
        setChangingPlan(true)
        const result = await changePlan(selectedPlan.key, billingCycle)

        if (!result?.paymentRequired) {
          await loadPlan()
          Alert.alert(
            t("common.successTitle") || "Plan updated",
            `${selectedPlan.name} ${t("plan.planNowActive") || "plan is now active."}`
          )
          return
        }

        if (!result?.payment) {
          throw new Error("Payment order was not created by the server.")
        }

        const paymentResult = await openRazorpayCheckout(result.payment)

        if (
          !paymentResult?.razorpay_payment_id ||
          !paymentResult?.razorpay_order_id ||
          !paymentResult?.razorpay_signature
        ) {
          throw new Error("Razorpay returned incomplete payment information.")
        }

        const verification = await verifySubscriptionPayment({
          razorpayPaymentId: paymentResult.razorpay_payment_id,
          razorpayOrderId: paymentResult.razorpay_order_id,
          razorpaySignature: paymentResult.razorpay_signature
        })

        const paymentVerified =
          verification?.success !== false &&
          (verification?.paymentStatus === undefined ||
            verification?.paymentStatus === "PAID" ||
            verification?.paymentStatus === "CAPTURED")

        if (!paymentVerified) {
          throw new Error(verification?.message || "Payment verification failed.")
        }

        await loadPlan()
        Alert.alert(
          t("common.successTitle") || "Payment successful",
          `${selectedPlan.name} ${t("plan.planNowActive") || "plan is now active."}`
        )
      } catch (error: any) {
        if (error?.code === "PAYMENT_CANCELLED") {
          Alert.alert(
            t("common.errorTitle") || "Payment cancelled",
            t("plan.planNotChanged") || "Your plan was not changed."
          )
        } else {
          Alert.alert(
            t("common.errorTitle") || "Payment unsuccessful",
            error?.message || t("plan.paymentFailed") || "We could not complete your payment. Please try again."
          )
        }
      } finally {
        setChangingPlan(false)
      }
    }

    if (Platform.OS === "web") {
      const confirmed = window.confirm(confirmationMessage)
      if (confirmed) await continueUpgrade()
      return
    }

    Alert.alert(
      selectedPlan.key === "free"
        ? t("plan.switchToFree") || "Switch to Free"
        : `${t("plan.upgradeTo") || "Upgrade to"} ${selectedPlan.name}`,
      confirmationMessage,
      [
        { text: t("common.cancel") || "Cancel", style: "cancel" },
        { text: t("common.continue") || "Continue", onPress: () => void continueUpgrade() }
      ]
    )
  }

  /*
   * BUY BOOSTER
   */
  const handleBooster = (booster: Booster) => {
    if (buyingBooster || changingPlan) return
    const confirmationMessage = `Add ${booster.jobs} jobs for ₹${booster.price}?`

    const continueBooster = async () => {
      try {
        setBuyingBooster(true)
        const result = await buyBooster(booster.code)

        if (!result?.paymentRequired) {
          await loadPlan()
          Alert.alert(
            t("common.successTitle") || "Booster added",
            `${booster.jobs} ${t("plan.additionalJobsAdded") || "additional jobs have been added."}`
          )
          return
        }

        if (!result?.payment) {
          throw new Error("Booster payment order was not created by the server.")
        }

        const paymentResult = await openRazorpayCheckout(result.payment)

        if (
          !paymentResult?.razorpay_payment_id ||
          !paymentResult?.razorpay_order_id ||
          !paymentResult?.razorpay_signature
        ) {
          throw new Error("Razorpay returned incomplete payment information.")
        }

        const verification = await verifyBoosterPayment({
          razorpayPaymentId: paymentResult.razorpay_payment_id,
          razorpayOrderId: paymentResult.razorpay_order_id,
          razorpaySignature: paymentResult.razorpay_signature
        })

        const paymentVerified =
          verification?.success !== false &&
          (verification?.paymentStatus === undefined ||
            verification?.paymentStatus === "PAID" ||
            verification?.paymentStatus === "CAPTURED")

        if (!paymentVerified) {
          throw new Error(verification?.message || "Booster payment verification failed.")
        }

        await loadPlan()
        Alert.alert(
          t("common.successTitle") || "Payment successful",
          `${booster.jobs} ${t("plan.additionalJobsAdded") || "additional jobs have been added."}`
        )
      } catch (error: any) {
        if (error?.code === "PAYMENT_CANCELLED") {
          Alert.alert(
            t("common.errorTitle") || "Payment cancelled",
            t("plan.boosterNotAdded") || "The booster was not added."
          )
        } else {
          Alert.alert(
            t("common.errorTitle") || "Payment unsuccessful",
            error?.message || t("plan.boosterFailed") || "We could not complete the booster purchase."
          )
        }
      } finally {
        setBuyingBooster(false)
      }
    }

    if (Platform.OS === "web") {
      const confirmed = window.confirm(confirmationMessage)
      if (confirmed) void continueBooster()
      return
    }

    Alert.alert(booster.title, confirmationMessage, [
      { text: t("common.cancel") || "Cancel", style: "cancel" },
      { text: t("common.continue") || "Continue", onPress: () => void continueBooster() }
    ])
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="workspace-premium" size={40} color="#2563EB" />
        <ActivityIndicator size="small" color="#2563EB" style={{ marginTop: 14 }} />
        <Text style={styles.loadingText}>
          {t("plan.loading") || "Loading subscription..."}
        </Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {/* HEADER */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>{t("plan.title") || "Plan & Usage"}</Text>
          <Text style={styles.pageSubtitle}>
            {t("plan.subtitle") || "Manage your subscription, billing and job usage"}
          </Text>
        </View>

        {loadError && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadPlan(true)}
            disabled={refreshing}
          >
            <MaterialIcons name="refresh" size={18} color="#2563EB" />
            <Text style={styles.retryText}>
              {refreshing
                ? t("common.refreshing") || "Refreshing..."
                : t("common.retry") || "Retry"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* CURRENT PLAN + USAGE CARD */}
      <View style={styles.currentPlanCard}>
        <View style={styles.currentPlanTop}>
          <View style={styles.currentPlanIcon}>
            <MaterialIcons name="workspace-premium" size={22} color="#F59E0B" />
          </View>

          <View style={styles.currentPlanInfo}>
            <Text style={styles.currentPlanLabel}>
              {t("plan.currentPlan") || "CURRENT PLAN"}
            </Text>
            <Text style={styles.currentPlanName}>{currentPlanName}</Text>
          </View>

          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>{t("plan.active") || "ACTIVE"}</Text>
          </View>
        </View>

        <View style={styles.compactDetailsRow}>
          <View style={styles.compactDetail}>
            <Text style={styles.compactDetailLabel}>{t("plan.billing") || "Billing"}</Text>
            <Text style={styles.compactDetailValue}>
              {currentPlan.monthly === 0
                ? t("plan.free") || "Free"
                : currentBillingCycle === "annual"
                ? `₹${currentPlan.annual}/mo`
                : `₹${currentPlan.monthly}/mo`}
            </Text>
          </View>

          <View style={styles.compactDetail}>
            <Text style={styles.compactDetailLabel}>{t("plan.renewal") || "Renewal"}</Text>
            <Text style={styles.compactDetailValue}>
              {formatRenewalDate(plan?.renewalDate)}
            </Text>
          </View>

          <View style={styles.compactDetail}>
            <Text style={styles.compactDetailLabel}>{t("plan.daysLeft") || "Days left"}</Text>
            <Text
              style={[
                styles.compactDetailValue,
                { color: (daysRemaining ?? 0) <= 7 ? "#FCA5A5" : "#34D399" }
              ]}
            >
              {daysRemaining ?? "—"}
            </Text>
          </View>
        </View>

        {/* ACTIVE BOOSTER SUMMARY */}
        {plan?.lastBoosterCode && (
          <View style={styles.compactBooster}>
            <MaterialIcons name="bolt" size={18} color="#FBBF24" />
            <View style={styles.compactBoosterInfo}>
              <Text style={styles.compactBoosterTitle}>
                {boosterTitle(plan.lastBoosterCode)}
              </Text>
              <Text style={styles.compactBoosterJobs}>
                +{plan.lastBoosterJobs ?? 0} {t("plan.jobs") || "jobs"}
              </Text>
            </View>
            <Text style={styles.compactBoosterDate}>
              {formatRenewalDate(plan.lastBoosterPurchasedAt)}
            </Text>
          </View>
        )}

        {/* USAGE METRICS */}
        <View style={styles.compactUsageHeader}>
          <Text style={styles.compactUsageTitle}>
            {t("plan.jobsUsed") || "Jobs used"}
          </Text>
          <Text style={styles.compactUsageNumber}>
            {jobsUsed}
            <Text style={styles.compactUsageLimit}>
              {" / "}
              {totalJobsAvailable}
            </Text>
          </Text>
        </View>

        {totalJobsAvailable !== "Unlimited" && (
          <>
            <View style={styles.progressBackgroundDark}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${usagePercentage}%`,
                    backgroundColor: isLimitReached
                      ? "#EF4444"
                      : isNearLimit
                      ? "#F59E0B"
                      : "#60A5FA"
                  }
                ]}
              />
            </View>

            <View style={styles.compactUsageFooter}>
              <Text style={styles.compactUsagePercent}>{usagePercentage}% used</Text>
              <Text
                style={[
                  styles.compactRemaining,
                  isLimitReached && styles.remainingDangerDark
                ]}
              >
                {isLimitReached
                  ? t("plan.limitReached") || "Limit reached"
                  : `${jobsRemaining} ${t("plan.remaining") || "remaining"}`}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* BILLING TOGGLE */}
      <View style={styles.billingSection}>
        <Text style={styles.sectionTitle}>
          {t("plan.choosePlan") || "Choose your plan"}
        </Text>
        <Text style={styles.sectionSubtitle}>
          {t("plan.upgradeSubtitle") || "Upgrade whenever your garage grows"}
        </Text>

        <View style={styles.billingToggle}>
          <TouchableOpacity
            disabled={changingPlan || buyingBooster}
            style={[
              styles.billingButton,
              billingCycle === "monthly" && styles.billingButtonActive
            ]}
            onPress={() => handleBillingCycleChange("monthly")}
          >
            <Text
              style={[
                styles.billingText,
                billingCycle === "monthly" && styles.billingTextActive
              ]}
            >
              {t("plan.monthly") || "Monthly"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={changingPlan || buyingBooster}
            style={[
              styles.billingButton,
              billingCycle === "annual" && styles.billingButtonActive
            ]}
            onPress={() => handleBillingCycleChange("annual")}
          >
            <Text
              style={[
                styles.billingText,
                billingCycle === "annual" && styles.billingTextActive
              ]}
            >
              {t("plan.annual") || "Annual"}
            </Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>{t("plan.save") || "SAVE"}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* PLAN LIST */}
      {Object.values(PLANS).map(item => {
        const isCurrent = item.key === currentPlanKey
        const monthlyPrice = item.monthly
        const annualMonthlyEquivalent = item.annual
        const annualPrice = getAnnualPrice(item)

        return (
          <View
            key={item.key}
            style={[
              styles.planOption,
              item.popular && styles.popularPlan,
              isCurrent && styles.currentPlanOption
            ]}
          >
            {item.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>
                  {t("plan.mostPopular") || "MOST POPULAR"}
                </Text>
              </View>
            )}

            <View style={styles.planOptionHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.planOptionName}>{item.name}</Text>
                <Text style={styles.planDescription}>{item.description}</Text>
              </View>

              {isCurrent && (
                <View style={styles.selectedBadge}>
                  <MaterialIcons name="check-circle" size={20} color="#16A34A" />
                  <Text style={styles.selectedText}>{t("plan.current") || "Current"}</Text>
                </View>
              )}
            </View>

            {item.key === "free" ? (
              <View style={styles.priceBlock}>
                <Text style={styles.freePrice}>{t("plan.free") || "Free"}</Text>
              </View>
            ) : billingCycle === "monthly" ? (
              <View style={styles.priceBlock}>
                <View style={styles.priceRow}>
                  <Text style={styles.currency}>₹</Text>
                  <Text style={styles.price}>{monthlyPrice}</Text>
                  <Text style={styles.pricePeriod}>{t("plan.perMonth") || "/month"}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.priceBlock}>
                <View style={styles.priceRow}>
                  <Text style={styles.currency}>₹</Text>
                  <Text style={styles.price}>{annualMonthlyEquivalent}</Text>
                  <Text style={styles.pricePeriod}>{t("plan.perMonth") || "/month"}</Text>
                </View>

                <View style={styles.annualTotalRow}>
                  <Text style={styles.annualTotalLabel}>
                    {t("plan.billedAnnually") || "Billed annually:"}
                  </Text>
                  <Text style={styles.annualTotalPrice}>
                    ₹{annualPrice}{t("plan.perYear") || "/year"}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.planSummary}>
              <View style={styles.planSummaryItem}>
                <MaterialIcons name="work-outline" size={18} color="#2563EB" />
                <Text style={styles.summaryText}>
                  {item.jobs} {t("plan.jobs") || "jobs"}
                </Text>
              </View>

              <View style={styles.planSummaryItem}>
                <MaterialIcons name="people-outline" size={18} color="#2563EB" />
                <Text style={styles.summaryText}>
                  {item.workers} {t("plan.workers") || "workers"}
                </Text>
              </View>
            </View>

            {!isCurrent && (
              <TouchableOpacity
                disabled={changingPlan || buyingBooster}
                style={[
                  styles.planButton,
                  item.popular && styles.planButtonPopular,
                  (changingPlan || buyingBooster) && styles.disabledButton
                ]}
                onPress={() => handleUpgrade(item)}
              >
                <Text
                  style={[
                    styles.planButtonText,
                    item.popular && styles.planButtonTextPopular
                  ]}
                >
                  {changingPlan
                    ? t("common.processing") || "Processing..."
                    : item.key === "free"
                    ? t("plan.switchToFree") || "Switch to Free"
                    : billingCycle === "annual"
                    ? `${t("plan.upgradeTo") || "Upgrade to"} · ₹${annualPrice}${t("plan.perYear") || "/year"}`
                    : `${t("plan.upgradeTo") || "Upgrade to"} ${item.name}`}
                </Text>

                {!changingPlan && (
                  <MaterialIcons
                    name="arrow-forward"
                    size={19}
                    color={item.popular ? "#2563EB" : "white"}
                  />
                )}
              </TouchableOpacity>
            )}
          </View>
        )
      })}

      {/* FEATURE COMPARISON ACCORDION */}
      <TouchableOpacity
        style={styles.featureToggle}
        onPress={() => setShowFeatures(val => !val)}
      >
        <View style={styles.featureToggleLeft}>
          <MaterialIcons name="compare" size={22} color="#2563EB" />
          <View>
            <Text style={styles.featureToggleTitle}>
              {t("plan.compareFeatures") || "Compare all features"}
            </Text>
            <Text style={styles.featureToggleSubtitle}>
              {t("plan.currentPlanFeatures") || "Features included in your current plan"}
            </Text>
          </View>
        </View>

        <MaterialIcons
          name={showFeatures ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={25}
          color="#6B7280"
        />
      </TouchableOpacity>

      {showFeatures && (
        <View style={styles.featureCard}>
          <View style={styles.featurePlanHeader}>
            <Text style={styles.featurePlanHeaderTitle}>{currentPlan.name}</Text>
            <Text style={styles.featurePlanHeaderText}>
              {t("plan.currentPlan") || "CURRENT PLAN"}
            </Text>
          </View>

          {FEATURES.map((feature, index) => (
            <View
              key={feature.name}
              style={[styles.featureRow, index !== 0 && styles.featureBorder]}
            >
              <Text style={styles.featureName}>{feature.name}</Text>
              <Text style={styles.featureValue}>{feature[currentPlanKey]}</Text>
            </View>
          ))}
        </View>
      )}

      {/* BOOSTERS */}
      <View style={styles.boosterSectionHeader}>
        <Text style={styles.sectionTitle}>
          {t("plan.extraJobs") || "Need extra jobs?"}
        </Text>
        <Text style={styles.sectionSubtitle}>
          {t("plan.oneTimeTopup") || "One-time job top-ups"}
        </Text>
      </View>

      <View style={styles.boosterInfo}>
        <MaterialIcons name="info-outline" size={19} color="#2563EB" />
        <Text style={styles.boosterInfoText}>
          {t("plan.boosterWarning") || "Booster jobs are valid only for the current billing month and do not carry over."}
        </Text>
      </View>

      {(plan?.availableBoosters ?? []).map(booster => (
        <View key={booster.code} style={styles.boosterCard}>
          <View style={styles.boosterIcon}>
            <MaterialIcons name="add-task" size={22} color="#2563EB" />
          </View>

          <View style={styles.boosterInfoColumn}>
            <Text style={styles.boosterTitle}>{boosterTitle(booster.code)}</Text>
            <Text style={styles.boosterJobs}>
              +{booster.jobs} {t("plan.jobs") || "jobs"}
            </Text>
            <Text style={styles.boosterBestFor}>
              {t("plan.bestFor") || "Best for:"} {boosterBestFor(booster.code)}
            </Text>
          </View>

          <View style={styles.boosterRight}>
            <Text style={styles.boosterPrice}>₹{booster.price}</Text>
            <Text style={styles.boosterCost}>
              {boosterCost(booster.jobs, booster.price)}
            </Text>

            <TouchableOpacity
              disabled={buyingBooster || changingPlan}
              style={[
                styles.boosterBuyButton,
                (buyingBooster || changingPlan) && styles.disabledButton
              ]}
              onPress={() =>
                handleBooster({
                  code: booster.code,
                  title: boosterTitle(booster.code),
                  jobs: booster.jobs,
                  price: booster.price,
                  cost: boosterCost(booster.jobs, booster.price),
                  bestFor: boosterBestFor(booster.code)
                })
              }
            >
              <Text style={styles.boosterBuyText}>
                {buyingBooster ? "..." : t("plan.buy") || "Buy"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={{ height: 50 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6"
  },
  contentContainer: {
    padding: 18
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
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between"
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827"
  },
  pageSubtitle: {
    color: "#6B7280",
    marginTop: 5,
    lineHeight: 20,
    maxWidth: 300
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10
  },
  retryText: {
    marginLeft: 4,
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "700"
  },
  currentPlanCard: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18
  },
  currentPlanTop: {
    flexDirection: "row",
    alignItems: "center"
  },
  currentPlanIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#1F2937",
    alignItems: "center",
    justifyContent: "center"
  },
  currentPlanInfo: {
    flex: 1,
    marginLeft: 10
  },
  currentPlanLabel: {
    color: "#9CA3AF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8
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
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 15
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34D399",
    marginRight: 4
  },
  activeText: {
    color: "#A7F3D0",
    fontSize: 10,
    fontWeight: "800"
  },
  compactDetailsRow: {
    flexDirection: "row",
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#374151"
  },
  compactDetail: {
    flex: 1
  },
  compactDetailLabel: {
    color: "#6B7280",
    fontSize: 10,
    marginBottom: 3
  },
  compactDetailValue: {
    color: "white",
    fontSize: 13,
    fontWeight: "700"
  },
  compactBooster: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#1F2937",
    flexDirection: "row",
    alignItems: "center"
  },
  compactBoosterInfo: {
    flex: 1,
    marginLeft: 8
  },
  compactBoosterTitle: {
    color: "white",
    fontSize: 12,
    fontWeight: "700"
  },
  compactBoosterJobs: {
    color: "#FBBF24",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 1
  },
  compactBoosterDate: {
    color: "#9CA3AF",
    fontSize: 10,
    fontWeight: "600"
  },
  compactUsageHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 14
  },
  compactUsageTitle: {
    color: "#D1D5DB",
    fontSize: 13,
    fontWeight: "600"
  },
  compactUsageNumber: {
    color: "white",
    fontSize: 20,
    fontWeight: "800"
  },
  compactUsageLimit: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "500"
  },
  progressBackgroundDark: {
    height: 8,
    backgroundColor: "#374151",
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 8
  },
  progressFill: {
    height: "100%",
    borderRadius: 20
  },
  compactUsageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6
  },
  compactUsagePercent: {
    color: "#9CA3AF",
    fontSize: 10,
    fontWeight: "600"
  },
  compactRemaining: {
    color: "#34D399",
    fontSize: 10,
    fontWeight: "700"
  },
  remainingDangerDark: {
    color: "#FCA5A5"
  },
  billingSection: {
    marginBottom: 14
  },
  billingToggle: {
    marginTop: 14,
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
    shadowOffset: { width: 0, height: 2 }
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
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6
  },
  saveBadgeText: {
    color: "#15803D",
    fontSize: 9,
    fontWeight: "800"
  },
  planOption: {
    backgroundColor: "white",
    borderRadius: 20,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12
  },
  popularBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4
  },
  planOptionHeader: {
    flexDirection: "row",
    alignItems: "flex-start"
  },
  planOptionName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827"
  },
  planDescription: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 3
  },
  selectedBadge: {
    marginLeft: 10,
    flexDirection: "row",
    alignItems: "center"
  },
  selectedText: {
    color: "#16A34A",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4
  },
  priceBlock: {
    marginTop: 16
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline"
  },
  freePrice: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827"
  },
  currency: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827"
  },
  price: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginLeft: 2
  },
  pricePeriod: {
    color: "#6B7280",
    fontSize: 13,
    marginLeft: 4
  },
  annualTotalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4
  },
  annualTotalLabel: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "600"
  },
  annualTotalPrice: {
    color: "#16A34A",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 4
  },
  planSummary: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6"
  },
  planSummaryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24
  },
  summaryText: {
    marginLeft: 6,
    color: "#374151",
    fontSize: 13,
    fontWeight: "600"
  },
  planButton: {
    marginTop: 16,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  planButtonPopular: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE"
  },
  planButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
    marginRight: 6
  },
  planButtonTextPopular: {
    color: "#2563EB"
  },
  disabledButton: {
    opacity: 0.6
  },
  featureToggle: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginTop: 6,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  featureToggleLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  featureToggleTitle: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 10
  },
  featureToggleSubtitle: {
    color: "#6B7280",
    fontSize: 11,
    marginLeft: 10,
    marginTop: 2
  },
  featureCard: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  featurePlanHeader: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6"
  },
  featurePlanHeaderTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800"
  },
  featurePlanHeaderText: {
    color: "#6B7280",
    fontSize: 10,
    marginTop: 2
  },
  featureRow: {
    minHeight: 48,
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
    fontSize: 13,
    textAlign: "right",
    marginLeft: 12
  },
  boosterSectionHeader: {
    marginTop: 6,
    marginBottom: 12
  },
  boosterInfo: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12
  },
  boosterInfoText: {
    flex: 1,
    marginLeft: 8,
    color: "#1E40AF",
    fontSize: 12,
    lineHeight: 18
  },
  boosterCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  boosterIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center"
  },
  boosterInfoColumn: {
    flex: 1,
    marginLeft: 12
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
    fontSize: 11,
    marginTop: 2
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
    fontSize: 10,
    marginTop: 1
  },
  boosterBuyButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    marginTop: 6
  },
  boosterBuyText: {
    color: "white",
    fontSize: 12,
    fontWeight: "800"
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827"
  },
  sectionSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 3
  }
})
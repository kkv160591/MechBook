import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native"

import { MaterialIcons } from "@expo/vector-icons"

import {
  useEffect,
  useState
} from "react"

import {
  getPlanDetails
}
from "../../services/settingsService"

export default function PlanUsageScreen() {

  const [plan, setPlan] =
  useState<any>(null)

  const [loading, setLoading] =
  useState(true)

  useEffect(() => {

    loadPlan()

  }, [])

  const loadPlan =
  async () => {

    try {

      const data =
        await getPlanDetails()

      setPlan(data)

    }

    finally {

      setLoading(false)

    }

  }

  const usagePercentage =
    (plan.jobsUsed /
      plan.jobsLimit) * 100

  const buyBooster = (
    jobs: number
  ) => {

    Alert.alert(
      "Booster",
      `${jobs} Job Booster selected`
    )

  }

  const upgradePlan = () => {

    Alert.alert(
      "Upgrade",
      "Razorpay integration coming soon"
    )

  }

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* PLAN CARD */}

      <View style={styles.planCard}>

        <View style={styles.planHeader}>

          <MaterialIcons
            name="workspace-premium"
            size={28}
            color="#F59E0B"
          />

          <Text style={styles.planName}>
            {plan.planName}
          </Text>

        </View>

        <Text style={styles.renewal}>
          Renewal Date:
          {" "}
          {plan.renewalDate}
        </Text>

        <Text style={styles.remaining}>
          {plan.daysRemaining}
          {" "}
          days remaining
        </Text>

      </View>

      {/* USAGE */}

      <View style={styles.card}>

        <Text style={styles.title}>
          Monthly Usage
        </Text>

        <Text style={styles.usageText}>
          {plan.jobsUsed}
          /
          {plan.jobsLimit}
          {" "}
          Jobs Used
        </Text>

        <View style={styles.progressBg}>

          <View
            style={[
              styles.progressFill,
              {
                width:
                  `${usagePercentage}%`
              }
            ]}
          />

        </View>

      </View>

      {/* BOOSTERS */}

      <Text style={styles.sectionTitle}>
        Job Boosters
      </Text>

      <BoosterCard
        title="+20 Jobs"
        price="₹99"
        onPress={() =>
          buyBooster(20)
        }
      />

      <BoosterCard
        title="+50 Jobs"
        price="₹199"
        onPress={() =>
          buyBooster(50)
        }
      />

      <BoosterCard
        title="+100 Jobs"
        price="₹299"
        onPress={() =>
          buyBooster(100)
        }
      />

      {/* UPGRADE */}

      <TouchableOpacity
        style={styles.upgradeBtn}
        onPress={upgradePlan}
      >

        <Text style={styles.upgradeText}>
          Upgrade Plan
        </Text>

      </TouchableOpacity>

      <View style={{ height: 50 }} />

    </ScrollView>

  )

}

function BoosterCard({
  title,
  price,
  onPress
}: any) {

  return (

    <View style={styles.boosterCard}>

      <View>

        <Text style={styles.boosterTitle}>
          {title}
        </Text>

        <Text style={styles.boosterPrice}>
          {price}
        </Text>

      </View>

      <TouchableOpacity
        style={styles.buyBtn}
        onPress={onPress}
      >

        <Text style={styles.buyText}>
          Buy
        </Text>

      </TouchableOpacity>

    </View>

  )

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16
  },

  planCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 22,
    marginBottom: 18
  },

  planHeader: {
    flexDirection: "row",
    alignItems: "center"
  },

  planName: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    marginLeft: 10
  },

  renewal: {
    color: "#D1D5DB",
    marginTop: 20
  },

  remaining: {
    color: "#10B981",
    marginTop: 8,
    fontWeight: "700"
  },

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12
  },

  usageText: {
    color: "#374151",
    marginBottom: 12
  },

  progressBg: {
    height: 12,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    overflow: "hidden"
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#2563EB"
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12
  },

  boosterCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },

  boosterTitle: {
    fontSize: 16,
    fontWeight: "700"
  },

  boosterPrice: {
    color: "#6B7280",
    marginTop: 4
  },

  buyBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12
  },

  buyText: {
    color: "white",
    fontWeight: "700"
  },

  upgradeBtn: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    marginTop: 20
  },

  upgradeText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16
  }

})
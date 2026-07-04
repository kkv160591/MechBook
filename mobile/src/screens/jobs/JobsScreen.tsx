import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Text,
  RefreshControl
} from "react-native"

import { Ionicons } from "@expo/vector-icons"

import {
  useState,
  useCallback
} from "react"

import {
  useFocusEffect
} from "@react-navigation/native"

import JobCard
from "../../components/JobCard"

import {
  getJobs
} from "../../services/jobService"

export default function JobsScreen({
  navigation
}: any) {

  const [jobs, setJobs] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const loadJobs =
    async () => {

      try {

        const response =
          await getJobs()

        setJobs(
          response.jobs || []
        )

      }

      catch (error) {

        console.log(error)

      }

      finally {

        setLoading(false)
        setRefreshing(false)

      }

    }

  useFocusEffect(

    useCallback(() => {

      setLoading(true)

      loadJobs()

    }, [])

  )

  const onRefresh =
    () => {

      setRefreshing(true)

      loadJobs()

    }

  if (loading) {

    return (

      <View style={styles.loader}>

        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

      </View>

    )

  }

  return (

    <View style={styles.container}>

      <FlatList

        data={jobs}

        keyExtractor={(item) =>
          item.jobId
        }

        refreshControl={

          <RefreshControl

            refreshing={refreshing}

            onRefresh={onRefresh}

          />

        }

        ListEmptyComponent={

          <View style={styles.emptyContainer}>

            <Ionicons
              name="construct-outline"
              size={70}
              color="#9CA3AF"
            />

            <Text style={styles.emptyTitle}>
              No Jobs Found
            </Text>

            <Text style={styles.emptyText}>
              Create your first job to get started.
            </Text>

          </View>

        }

        renderItem={({ item }) => (

          <JobCard
            job={item}
          />

        )}

      />

      <TouchableOpacity

        style={styles.fab}

        onPress={() =>

          navigation.navigate(
            "AddJob"
          )

        }

      >

        <Ionicons

          name="add"

          size={28}

          color="white"

        />

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

  loader: {

    flex: 1,

    justifyContent: "center",

    alignItems: "center"

  },

  fab: {

    position: "absolute",

    right: 20,

    bottom: 30,

    width: 60,

    height: 60,

    borderRadius: 30,

    backgroundColor: "#2563EB",

    justifyContent: "center",

    alignItems: "center",

    elevation: 5

  },

  emptyContainer: {

    marginTop: 120,

    alignItems: "center",

    justifyContent: "center"

  },

  emptyTitle: {

    fontSize: 20,

    fontWeight: "700",

    color: "#111827",

    marginTop: 16

  },

  emptyText: {

    color: "#6B7280",

    marginTop: 8,

    textAlign: "center",

    paddingHorizontal: 40

  }

})
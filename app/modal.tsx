"use client"

import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, Dimensions, Text, TouchableOpacity, useColorScheme, View } from "react-native"
import { LineChart } from "react-native-chart-kit"
import { createModalStyles } from "../app/styles/modal.styles"

const screenWidth = Dimensions.get("window").width

type ExchangeParams = {
  from: string
  to: string
}

export default function CurrencyTrendChart() {
  const params = useLocalSearchParams<ExchangeParams>()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const styles = createModalStyles(isDark)

  const [rates, setRates] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [currentRate, setCurrentRate] = useState(null)
  const router = useRouter()

  const getLast30Days = useCallback(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 30)
    const format = (d: Date) => d.toISOString().split("T")[0]
    return { start: format(start), end: format(end) }
  }, [])

  const fetchRates = useCallback(
    async (from: string, to: string): Promise<void> => {
      const { start, end } = getLast30Days()
      setLoading(true)
      try {
        const url = `https://api.frankfurter.dev/v1/${start}..${end}?from=${from}&to=${to}`
        const res = await fetch(url)
        const json = await res.json()
        const values = Object.values(json.rates).map((r: any) => r[to])
        setRates(values)
        setCurrentRate(values[values.length - 1])
      } catch (err) {
        console.error("Error fetching rates:", err)
      } finally {
        setLoading(false)
      }
    },
    [getLast30Days],
  )

  useEffect(() => {
    if (params.from && params.to) {
      fetchRates(params.from, params.to)
    }
  }, [params.from, params.to, fetchRates])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Cargando datos del tipo de cambio...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header2}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={isDark ? "#e2e8f0" : "#374151"} />
        </TouchableOpacity>
        <View style={styles.placeholder}></View>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>
          {params.from} <Ionicons name="swap-horizontal" size={26} color={isDark ? "#60a5fa" : "#2563EB"} /> {params.to}
        </Text>
        <Text style={styles.subtitle}>Tendencia de los ultimos 30 dias</Text>
      </View>

      <View style={styles.chartCard}>
        <LineChart
          data={{
            labels: [],
            datasets: [
              {
                data: rates,
                color: () => "#2563EB",
                strokeWidth: 2,
              },
            ],
          }}
          width={screenWidth - 20}
          height={340}
          chartConfig={{
            backgroundGradientFrom: isDark ? "#1e293b" : "#EFF6FF",
            backgroundGradientTo: isDark ? "#0f172a" : "#FFFFFF",
            decimalPlaces: 3,
            color: (opacity = 1) => `rgba(37,99,235,${opacity})`,
            labelColor: () => (isDark ? "#9ca3af" : "#6B7280"),
            propsForDots: {
              r: "3",
              strokeWidth: "2",
              stroke: "#2563EB",
              fill: isDark ? "#0f172a" : "#F3F4F6",
            },
          }}
          bezier
          style={styles.chart}
          withVerticalLabels={false}
          withHorizontalLabels
          withInnerLines={false}
          yLabelsOffset={10}
        ></LineChart>

        {currentRate && (
          <View style={styles.rateBox}>
            <Text style={styles.rateText}>
              100{params.from} <Ionicons name="swap-horizontal" size={18} color="#2563EB" />{" "}
              {(currentRate * 100).toFixed(3)}
              {params.to}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

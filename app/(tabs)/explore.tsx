import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, useColorScheme, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { createExploreStyles } from "../styles/explore.styles"

type Currency = {
  code: string
  name: string
  flag: string
}

type ExchangeRate = {
  code: string
  value: number
}

export default function AllCurrencyScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const styles = createExploreStyles(isDark)

  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState("AUD")
  const [rates, setRates] = useState<ExchangeRate[]>([])
  const [rateLoading, setRateLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAllCurrencyData()
  }, [])

  const fetchAllCurrencyData = async () => {
    setIsLoading(true)
    try {
      const url = `https://api.frankfurter.dev/v1/currencies`
      const response = await fetch(url)
      const data = await response.json()
      const list = Object.entries(data).map(([code, name]) => ({
        code,
        name: name as string,
        flag: getFlagEmoji(code),
      }))
      if (response.ok) {
        setCurrencies(list)
      } else {
        Alert.alert("Error", "Failed to fetch currency data")
      }
    } catch (error) {
      console.error("Currency api error:", error)
      Alert.alert("Error", "Failed to fetch currency data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAllCurrencyData()
    setRefreshing(false)
  }

  const getFlagEmoji = (code: string) => {
    const base = 127397
    const country = code.slice(0, 2)
    return country
      .toUpperCase()
      .split("")
      .map((char) => String.fromCodePoint(base + char.charCodeAt(0)))
      .join("")
  }

  useEffect(() => {
    if (currencies.length > 0) {
      const exists = currencies.find((c) => c.code === selectedCurrency)
      const code = exists ? selectedCurrency : currencies[0].code
      if (code !== selectedCurrency) setSelectedCurrency(code)
      fetchRates(code)
    }
  }, [currencies])

  const fetchRates = async (baseCode: string) => {
    setRateLoading(true)
    try {
      const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${baseCode}`)
      const json = await res.json()
      if (res.ok) {
        const ratesArray = Object.entries(json.rates).map(([code, value]) => ({
          code: code as string,
          value: value as number,
        }))
        setRates(ratesArray)
      }
    } catch (err) {
      console.error("Fectches error:", err)
      setRates([])
    } finally {
      setRateLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchRates(selectedCurrency)
    setRefreshing(false)
  }

  const renderRateRow = (item: ExchangeRate) => (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: "/modal",
          params: { from: selectedCurrency, to: item.code },
        })
      }
    >
      <Text style={styles.cellLeft}>
        {getFlagEmoji(item.code)} <Text style={styles.code}>{item.code}</Text>
      </Text>

      <Text style={styles.cellRight}>{`100${selectedCurrency} = ${(item.value * 100).toFixed(2)}${item.code}`}</Text>
    </TouchableOpacity>
  )

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={isDark ? "#60A5FA" : "#3B82F6"} />
          <Text style={styles.loadingText}>Cargando información...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Divisas</Text>
      </View>

      <View style={styles.chipContainer}>
        <FlatList
          horizontal
          data={currencies}
          keyExtractor={(item: Currency) => item.code}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }: { item: Currency }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.chip, selectedCurrency === item.code ? styles.chipActive : styles.chipInactive]}
              onPress={() => {
                if (selectedCurrency !== item.code) {
                  setSelectedCurrency(item.code)
                  fetchRates(item.code)
                }
              }}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedCurrency === item.code ? styles.chipTextActive : styles.chipTextInactive,
                ]}
              >
                {item.flag}
                {item.code}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {rateLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={isDark ? "#60A5FA" : "#3B82F6"} />
          <Text style={{ color: isDark ? "#D1D5DB" : "#111827", marginTop: 10 }}>
            Cargando tipos de cambio de {selectedCurrency}
          </Text>
        </View>
      ) : (
        <FlatList
          data={rates}
          keyExtractor={(item: ExchangeRate) => item.code}
          renderItem={({ item }: { item: ExchangeRate }) => renderRateRow(item)}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: 0 }}
        />
      )}
    </SafeAreaView>
  )
}

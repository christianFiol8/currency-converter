import Ionicons from "@expo/vector-icons/Ionicons"
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { createExchangeStyles } from "../styles/exchange.styles"

type Currency = {
  code: string
  name: string
  flag: string
}

export default function ExchangeScreeen() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const styles = createExchangeStyles(isDark)

  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [from, setFrom] = useState("MXN")
  const [to, setTo] = useState("USD")
  const [showFromList, setShowFromList] = useState(false)
  const [showToList, setShowToList] = useState(false)
  const [rateLoading, setRateLoading] = useState(false)
  const [rate, setRate] = useState<number | null>(null)
  const [amount, setAmount] = useState("")
  const [result, setResult] = useState("")

  useEffect(() => {
    fetchCurrencyData()
  }, [])

  const getFlagEmoji = (code: string) => {
    const base = 127397
    const country = code.slice(0, 2)
    return country
      .toUpperCase()
      .split("")
      .map((char) => String.fromCodePoint(base + char.charCodeAt(0)))
      .join("")
  }

  const fetchCurrencyData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`https://api.frankfurter.dev/v1/currencies`)
      const data = await response.json()
      if (response.status == 200) {
        const list = Object.entries(data).map(([code, name]) => ({
          code,
          name: name as string,
          flag: getFlagEmoji(code),
        }))
        setCurrencies(list)
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch currency data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (rate && amount) {
        const converted = (Number.parseFloat(amount) * rate).toFixed(2)
        setResult(`${amount}${from}=${converted}${to}`)
      } else setResult("")
    }, 500)
    return () => clearTimeout(timeout)
  }, [amount, rate])

  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (from && to && from !== to) {
        setRateLoading(true)
        try {
          const url = `https://api.frankfurter.dev/v1/latest?from=${from}&to=${to}`
          const response = await fetch(url)
          const data = await response.json()
          if (data?.rates?.[to]) {
            setRate(data.rates[to])
          }
        } catch (error) {
          setRate(null)
        } finally {
          setRateLoading(false)
        }
      }
    }
    fetchExchangeRate()
  }, [from, to])

  const renderCurrencyList = (onSelect: (code: string) => void, top: number) => {
    return (
      <FlatList
        data={currencies}
        keyExtractor={(item) => item.code}
        style={[
          styles.list,
          {
            top,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item]}
            onPress={() => {
              onSelect(item.code)
              Keyboard.dismiss()
              setShowFromList(false)
              setShowToList(false)
            }}
          >
            <Text style={styles.itemText}>
              {item.flag}
              {item.code} - {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={isDark ? "#818CF8" : "#3B82F6"} />
          <Text style={styles.loadingText}>Cargando información...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss()
        setShowFromList(false)
        setShowToList(false)
      }}
      accessible={false}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.header}>
            <Image source={require("@/assets/images/logoConverter.png")} style={styles.logo} />
            <Text style={styles.title}>Conversor de divisas</Text>
          </View>

          <Text style={styles.label}>De:</Text>
          <TouchableOpacity
            onPress={() => {
              setShowFromList(!showFromList)
              setShowToList(false)
            }}
          >
            <View style={styles.inputBox}>
              <Text style={styles.selected}>
                {getFlagEmoji(from)}
                {from}
              </Text>
            </View>
          </TouchableOpacity>
          {showFromList && renderCurrencyList(setFrom, 240)}

          {(showFromList || showToList) && (
            <Pressable
              style={styles.overlay}
              onPress={() => {
                setShowFromList(false)
                setShowToList(false)
                Keyboard.dismiss()
              }}
            />
          )}

          <Text style={styles.label}>A:</Text>
          <TouchableOpacity
            onPress={() => {
              setShowToList(!showToList)
              setShowFromList(false)
            }}
          >
            <View style={styles.inputBox}>
              <Text style={styles.selected}>
                {getFlagEmoji(to)}
                {to}
              </Text>
            </View>
          </TouchableOpacity>
          {showToList && renderCurrencyList(setTo, 340)}

          {rateLoading && (
            <ActivityIndicator size="large" style={{ marginTop: 30 }} color={isDark ? "#818CF8" : "#3B82F6"} />
          )}
          {rate && !rateLoading && from !== to && (
            <View style={styles.rateBox}>
              <Text style={styles.rateText}>
                100{from}
                {"  "}
                <Ionicons name="swap-horizontal" size={20} color={isDark ? "#A5B4FC" : "#3B82F6"} />
                {"  "}
                {(rate * 100).toFixed(4)}
                {to}
              </Text>
            </View>
          )}

          <TextInput
            style={styles.amount}
            placeholder="Ingresa cantidad"
            placeholderTextColor={isDark ? "#666" : "#999"}
            keyboardType="numeric"
            value={amount}
            onChangeText={(text) => {
              const filtered = text.replace(/[^0-9.]/g, "")
              const parts = filtered.split(".")
              if (parts.length > 2) return
              setAmount(filtered)
            }}
          />
          {result && from !== to && (
            <LinearGradient
              colors={isDark ? ["#312E81", "#6366F1"] : ["#3B82F6", "#10B981"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.resultCard}
            >
              <Text style={styles.resultText}>{result}</Text>
            </LinearGradient>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

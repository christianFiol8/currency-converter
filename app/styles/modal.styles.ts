import { StyleSheet } from "react-native"

export const createModalStyles = (isDark: boolean) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 10,
      backgroundColor: isDark ? "#0f172a" : "#F3F4F6",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDark ? "#0f172a" : "#F9FAFB",
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      fontWeight: "500",
      color: isDark ? "#cbd5e1" : "#374151",
    },
    header2: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 14,
      marginBottom: 10,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "#334155" : "#E5E7EB",
    },
    placeholder: {
      width: 40,
    },
    header: {
      alignItems: "center",
      marginBottom: 10,
    },
    title: {
      fontSize: 26,
      fontWeight: "700",
      letterSpacing: 0.5,
      color: isDark ? "#93c5fd" : "#1E3A8A",
    },
    subtitle: {
      fontSize: 15,
      marginTop: 4,
      color: isDark ? "#9ca3af" : "#6B7280",
    },
    chartCard: {
      borderRadius: 20,
      paddingVertical: 16,
      paddingHorizontal: 8,
      alignItems: "center",
      elevation: 0,
    },
    chart: {
      borderRadius: 10,
      marginBottom: -90,
    },
    rateBox: {
      marginTop: 20,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },
    rateText: {
      fontSize: 17,
      fontWeight: "600",
      color: isDark ? "#93c5fd" : "#1E3A8A",
    },
  })
}

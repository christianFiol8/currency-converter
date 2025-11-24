import { StyleSheet } from "react-native"

export const createExploreStyles = (isDark: boolean) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#1E1E1E" : "#F9FAFB",
    },
    loadingCenter: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      fontWeight: "500",
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: isDark ? "" : "#FFFFFF",
      borderBottomColor: isDark ? "#3F3F46" : "#E5E7EB",
      borderBottomWidth: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: isDark ? "#E5E7EB" : "#1E1E1E",
    },
    chipContainer: {
      height: 52,
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      marginRight: 10,
      borderWidth: 1,
    },
    chipActive: {
      backgroundColor: "#2563EB",
      borderColor: "#2563EB",
    },
    chipInactive: {
      backgroundColor: isDark ? "#374151" : "#FFFFFF",
      borderColor: isDark ? "#4B5563" : "#E6E9EE",
    },
    chipText: {
      fontSize: 15,
      fontWeight: "600",
      letterSpacing: 0.2,
    },
    chipTextActive: {
      color: "#FFFFFF",
    },
    chipTextInactive: {
      color: isDark ? "#E5E7EB" : "#111827",
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginVertical: 6,
      backgroundColor: isDark ? "#2A2E39" : "#FFFFFF",
    },
    cellLeft: {
      flex: 1,
      fontSize: 16,
      color: isDark ? "#E5E7EB" : "#111827",
    },
    code: {
      fontSize: 14,
      fontWeight: "700",
      marginLeft: 6,
      color: isDark ? "#93C5FD" : "#1F2937",
    },
    cellRight: {
      fontSize: 14,
      textAlign: "right",
      color: isDark ? "#D1D5DB" : "#111827",
    },
    separator: {
      height: 1,
      backgroundColor: "#E6E6E6",
      marginLeft: 16,
    },
  })
}

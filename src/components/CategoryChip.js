import { TouchableOpacity, Text, StyleSheet } from "react-native"
import PropTypes from "prop-types"
import { Ionicons } from "@expo/vector-icons"

const ICONS = {
  space: "rocket-outline",
  sports: "football-outline",
  history: "shield-outline",
  maths: "calculator-outline",
  "random quiz": "shuffle-outline",
  science: "flask-outline",
}

const CategoryChip = ({ title, onPress }) => {
  const iconName = ICONS[title.toLowerCase()] || "help-circle-outline"

  return (
    <TouchableOpacity onPress={onPress} style={styles.chip}>
      <Ionicons name={iconName} size={24} color="#ffffff" />
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  )
}

CategoryChip.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func,
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: "#4f46e5",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 8,
    minHeight: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
})

export default CategoryChip

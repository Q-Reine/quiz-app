import { TouchableOpacity, Text, StyleSheet, View } from "react-native"
import PropTypes from "prop-types"
import { Ionicons } from "@expo/vector-icons"

const QuizCard = ({ title, color = "#667eea", icon = "help-circle", onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, { backgroundColor: color }]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={32} color="#ffffff" />
      </View>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  )
}

QuizCard.propTypes = {
  title: PropTypes.string.isRequired,
  color: PropTypes.string,
  icon: PropTypes.string,
  onPress: PropTypes.func,
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainer: {
    marginBottom: 12,
  },
  title: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
})

export default QuizCard

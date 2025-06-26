import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import Icon from "react-native-vector-icons/MaterialIcons"

const { width } = Dimensions.get("window")

const avatarOptions = [
  { id: 1, icon: "person", color: ["#FF6B35", "#FF4500"] },
  { id: 2, icon: "face", color: ["#4CAF50", "#2E7D32"] },
  { id: 3, icon: "sentiment-very-satisfied", color: ["#2196F3", "#1565C0"] },
  { id: 4, icon: "psychology", color: ["#9C27B0", "#6A1B9A"] },
  { id: 5, icon: "smart-toy", color: ["#FF9800", "#F57C00"] },
  { id: 6, icon: "pets", color: ["#795548", "#5D4037"] },
  { id: 7, icon: "sports-esports", color: ["#607D8B", "#455A64"] },
  { id: 8, icon: "school", color: ["#E91E63", "#C2185B"] },
  { id: 9, icon: "star", color: ["#FFD700", "#FFA000"] },
  { id: 10, icon: "favorite", color: ["#F44336", "#C62828"] },
  { id: 11, icon: "flash-on", color: ["#FFEB3B", "#F57F17"] },
  { id: 12, icon: "local-fire-department", color: ["#FF5722", "#D84315"] },
]

export default function AvatarPicker({ visible, onClose, onSelect, currentAvatar }) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || avatarOptions[0])

  const handleSelect = () => {
    onSelect(selectedAvatar)
    onClose()
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Avatar</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.avatarGrid}>
              {avatarOptions.map((avatar) => (
                <TouchableOpacity
                  key={avatar.id}
                  style={[styles.avatarOption, selectedAvatar?.id === avatar.id && styles.selectedAvatarOption]}
                  onPress={() => setSelectedAvatar(avatar)}
                >
                  <LinearGradient colors={avatar.color} style={styles.avatarGradient}>
                    <Icon name={avatar.icon} size={32} color="#FFFFFF" />
                  </LinearGradient>
                  {selectedAvatar?.id === avatar.id && (
                    <View style={styles.selectedBadge}>
                      <Icon name="check" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSelect} style={styles.selectButton}>
              <LinearGradient colors={["#FF6B35", "#FF4500"]} style={styles.selectButtonGradient}>
                <Text style={styles.selectButtonText}>Select Avatar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  avatarOption: {
    width: (width - 80) / 4,
    aspectRatio: 1,
    marginBottom: 16,
    position: "relative",
  },
  selectedAvatarOption: {
    transform: [{ scale: 1.1 }],
  },
  avatarGradient: {
    flex: 1,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
  },
  selectButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
  },
  selectButtonGradient: {
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
})

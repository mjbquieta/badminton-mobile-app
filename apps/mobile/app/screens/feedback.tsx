import { useToast } from "@/components/Toast";
import { BadmintonPalette } from "@/constants/palette";
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const FEEDBACK_TYPES = ["Bug Report", "Suggestion", "Other"] as const;

export function FeedbackContent() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<(typeof FEEDBACK_TYPES)[number]>("Bug Report");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isAuthenticated = !!user;

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!email || !message) return;

    setSubmitting(true);
    try {
      const res = await fetch("https://formspree.io/f/mkooqkvn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, type, message }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      setSubmitted(true);
      showToast({ message: "Feedback sent! Thank you.", type: "success" });
    } catch {
      showToast({ message: "Failed to send feedback. Please try again.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setMessage("");
    setType("Bug Report");
    setSubmitted(false);
    if (!isAuthenticated) setEmail("");
  };

  if (submitted) {
    return (
      <View className="flex-1 items-center justify-center px-6 pb-20">
        <View className="bg-secondary border border-dark-100 rounded-2xl p-8 w-full items-center">
          <View className="size-16 rounded-full bg-court-deep/30 items-center justify-center mb-4">
            <Text className="text-3xl">✓</Text>
          </View>
          <Text className="text-light-100 text-xl font-bold mb-2">
            Thank You!
          </Text>
          <Text className="text-light-300 text-sm text-center mb-6">
            Your feedback has been submitted successfully. We appreciate your input!
          </Text>
          <TouchableOpacity
            onPress={handleReset}
            className="bg-court-deep/30 px-6 py-3 rounded-xl"
          >
            <Text className="text-court-lime font-semibold text-sm">
              Send Another
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerClassName="px-6 py-4 pb-40"
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <View className="mb-3">
          <Text className="text-light-200 text-sm mb-1">Name (optional)</Text>
          <TextInput
            className="w-full px-4 py-3 rounded-xl bg-dark-200 border border-dark-100 text-light-100"
            placeholder="Your name"
            placeholderTextColor={BadmintonPalette.text.muted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        {/* Email */}
        <View className="mb-3">
          <Text className="text-light-200 text-sm mb-1">Email</Text>
          <TextInput
            className={`w-full px-4 py-3 rounded-xl bg-dark-200 border border-dark-100 text-light-100 ${
              isAuthenticated ? "opacity-50" : ""
            }`}
            placeholder="you@example.com"
            placeholderTextColor={BadmintonPalette.text.muted}
            value={email}
            onChangeText={isAuthenticated ? undefined : setEmail}
            editable={!isAuthenticated}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Type */}
        <View className="mb-3">
          <Text className="text-light-200 text-sm mb-1">Type</Text>
          <View className="flex-row gap-2">
            {FEEDBACK_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                className={`flex-1 py-2.5 rounded-xl items-center border ${
                  type === t
                    ? "bg-court-deep/30 border-court-lime/40"
                    : "bg-dark-200 border-dark-100"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    type === t ? "text-court-lime" : "text-light-300"
                  }`}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Message */}
        <View className="mb-6">
          <Text className="text-light-200 text-sm mb-1">Message</Text>
          <TextInput
            className="w-full px-4 py-3 rounded-xl bg-dark-200 border border-dark-100 text-light-100 min-h-[120px]"
            placeholder="Describe your feedback, bug, or suggestion..."
            placeholderTextColor={BadmintonPalette.text.muted}
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting || !email || !message}
          className="w-full py-3.5 rounded-xl bg-court-lime items-center"
          style={{ opacity: submitting || !email || !message ? 0.5 : 1 }}
        >
          {submitting ? (
            <ActivityIndicator color={BadmintonPalette.text.onAccent} />
          ) : (
            <Text className="text-primary font-bold text-base">
              Send Feedback
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

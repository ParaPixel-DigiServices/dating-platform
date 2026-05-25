import React from 'react';
import {
  View,
  StyleSheet,
  ViewProps,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  scrollable?: boolean;
  backgroundColor?: string;
}

export const ScreenWrapper = ({
  children,
  scrollable = false,
  backgroundColor = '#fff',
  style,
  ...props
}: ScreenWrapperProps) => {
  const content = (
    <View style={[styles.container, { backgroundColor }, style]} {...props}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 8,
  },
});

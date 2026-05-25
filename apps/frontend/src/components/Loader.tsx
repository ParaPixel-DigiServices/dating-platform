import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

interface LoaderProps {
  size?: 'small' | 'large';
  color?: string;
}

export const Loader = ({ size = 'large', color = '#000' }: LoaderProps) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

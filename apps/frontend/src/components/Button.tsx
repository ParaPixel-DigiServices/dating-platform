import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button = ({
  onPress,
  title,
  disabled = false,
  loading = false,
  variant = 'primary',
}: ButtonProps) => {
  const buttonVariantStyles = {
    primary: styles.buttonPrimary,
    secondary: styles.buttonSecondary,
    outline: styles.buttonOutline,
  };
  const textVariantStyles = {
    primary: styles.textPrimary,
    secondary: styles.textSecondary,
    outline: styles.textOutline,
  };

  const style = [
    styles.button,
    buttonVariantStyles[variant],
    disabled && styles.disabled,
  ];

  const textStyle = [
    styles.text,
    textVariantStyles[variant],
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={style}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={disabled ? 1 : 0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#000' : '#fff'} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonPrimary: {
    backgroundColor: '#000',
  },
  buttonSecondary: {
    backgroundColor: '#666',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  textPrimary: {
    color: '#fff',
  },
  textSecondary: {
    color: '#fff',
  },
  textOutline: {
    color: '#000',
  },
  disabledText: {
    opacity: 0.6,
  },
});

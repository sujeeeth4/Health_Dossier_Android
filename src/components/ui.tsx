import Ionicons from '@expo/vector-icons/Ionicons';
import { ReactNode } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleProp, StyleSheet,
  Text, TextInput, TextInputProps, TextStyle, View, ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, fonts, layout } from '@/constants/theme';

export function Screen({ children, scroll = true, contentStyle }: { children: ReactNode; scroll?: boolean; contentStyle?: StyleProp<ViewStyle> }) {
  const body = scroll
    ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.screenContent, contentStyle]}>{children}</ScrollView>
    : <View style={[styles.screenContent, styles.flex, contentStyle]}>{children}</View>;
  return <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>{body}</KeyboardAvoidingView></SafeAreaView>;
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return <View style={styles.brand} accessibilityLabel="Health Dossier">
    {!compact && <Text style={[styles.brandWord, { color: colors.blue }]}>Health</Text>}
    <Svg width={39} height={36} viewBox="10 0 92 84" accessibilityElementsHidden>
      <Path d="M54 14C43 5 26 11 13 12c9 8 17 9 26 9-6 3-12 4-18 4 7 6 16 7 25 2-4 4-9 6-14 7 8 5 17 2 23-4M58 14C69 5 86 11 99 12c-9 8-17 9-26 9 6 3 12 4 18 4-7 6-16 7-25 2 4 4 9 6 14 7-8 5-17 2-23-4" fill={colors.blue}/>
      <Path d="M56 15v60" stroke="#28AF77" strokeWidth={5.5} strokeLinecap="round"/>
      <Circle cx={56} cy={9} r={7} fill="#28AF77"/>
      <Path d="M55 27c15 0 16 17 2 19-13 2-13 12-1 14 10 2 8 9 1 13" stroke={colors.blue} strokeWidth={4.2} strokeLinecap="round" fill="none"/>
    </Svg>
    {!compact && <Text style={[styles.brandWord, { color: colors.green }]}>Dossier</Text>}
  </View>;
}

export function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: ReactNode }) {
  return <View style={styles.pageHeader}><View style={styles.pageHeaderText}>{eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}<Text style={styles.title}>{title}</Text>{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}</View>{action}</View>;
}

type ButtonProps = { title: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap; kind?: 'primary' | 'secondary' | 'danger' | 'ghost'; disabled?: boolean; loading?: boolean; style?: StyleProp<ViewStyle> };
export function Button({ title, onPress, icon, kind = 'primary', disabled, loading, style }: ButtonProps) {
  return <Pressable onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [styles.button, styles[`button_${kind}`], pressed && styles.pressed, (disabled || loading) && styles.disabled, style]}>
    {loading ? <ActivityIndicator color={kind === 'primary' ? colors.blackGreen : colors.text}/> : <>{icon && <Ionicons name={icon} size={18} color={kind === 'primary' ? colors.blackGreen : kind === 'danger' ? colors.error : colors.text}/>}<Text style={[styles.buttonText, kind === 'primary' && styles.buttonTextPrimary, kind === 'danger' && { color: colors.error }]}>{title}</Text></>}
  </Pressable>;
}

export function IconButton({ icon, label, onPress, danger = false }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; danger?: boolean }) {
  return <Pressable accessibilityLabel={label} hitSlop={8} onPress={onPress} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}><Ionicons name={icon} size={21} color={danger ? colors.error : colors.muted}/></Pressable>;
}

export function Field({ label, hint, multiline, style, ...props }: TextInputProps & { label: string; hint?: string; style?: StyleProp<TextStyle> }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput placeholderTextColor={colors.muted} multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} {...props} style={[styles.input, multiline && styles.textarea, style]}/>{hint && <Text style={styles.hint}>{hint}</Text>}</View>;
}

export function ChoiceChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text></Pressable>;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) { return <View style={[styles.card, style]}>{children}</View>; }

export function EmptyState({ icon, title, body, action }: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string; action?: ReactNode }) {
  return <Card style={styles.empty}><View style={styles.emptyIcon}><Ionicons name={icon} size={31} color={colors.green}/></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyBody}>{body}</Text>{action}</Card>;
}

export function Notice({ children, error = false }: { children: ReactNode; error?: boolean }) { return <Text style={[styles.notice, error && styles.noticeError]}>{children}</Text>; }
export function Divider() { return <View style={styles.divider}/>; }

export const sharedStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  label: { color: colors.green, fontFamily: fonts.sansMedium, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase' },
  heading: { color: colors.text, fontFamily: fonts.serif, fontSize: 25, lineHeight: 31 },
  body: { color: colors.muted, fontFamily: fonts.sans, fontSize: 13, lineHeight: 21 },
});

const styles = StyleSheet.create({
  flex: { flex: 1 }, screen: { flex: 1, backgroundColor: colors.background },
  screenContent: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingHorizontal: layout.gutter, paddingBottom: 120 },
  brand: { flexDirection: 'row', alignItems: 'center' }, brandWord: { fontFamily: fonts.sansMedium, fontSize: 22, letterSpacing: -0.8, marginHorizontal: -1 },
  pageHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, paddingTop: 23, paddingBottom: 25 },
  pageHeaderText: { flex: 1 }, eyebrow: { color: colors.green, fontFamily: fonts.sansMedium, fontSize: 10, letterSpacing: 1.6, marginBottom: 8 },
  title: { color: colors.text, fontFamily: fonts.serif, fontSize: 38, lineHeight: 44, letterSpacing: -1.2 }, subtitle: { color: colors.muted, fontFamily: fonts.sans, fontSize: 14, lineHeight: 22, marginTop: 7 },
  button: { minHeight: 48, borderRadius: 9, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderWidth: 1 },
  button_primary: { backgroundColor: colors.green, borderColor: colors.green }, button_secondary: { backgroundColor: colors.surface, borderColor: colors.line },
  button_danger: { backgroundColor: colors.warm, borderColor: colors.line }, button_ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  buttonText: { color: colors.text, fontFamily: fonts.sansMedium, fontSize: 14 }, buttonTextPrimary: { color: colors.blackGreen },
  pressed: { opacity: 0.72 }, disabled: { opacity: 0.45 }, iconButton: { width: 42, height: 42, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSoft },
  field: { gap: 8 }, fieldLabel: { color: colors.text, fontFamily: fonts.sansMedium, fontSize: 12 },
  input: { minHeight: 49, borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.surface, color: colors.text, fontFamily: fonts.sans, fontSize: 14, paddingHorizontal: 14 },
  textarea: { minHeight: 104, paddingTop: 13 }, hint: { color: colors.muted, fontFamily: fonts.sans, fontSize: 11, lineHeight: 16 },
  chip: { borderWidth: 1, borderColor: colors.line, borderRadius: 99, paddingHorizontal: 13, paddingVertical: 9, backgroundColor: colors.surface },
  chipSelected: { borderColor: colors.green, backgroundColor: colors.sage }, chipText: { color: colors.muted, fontFamily: fonts.sansMedium, fontSize: 12 }, chipTextSelected: { color: colors.greenStrong },
  card: { borderWidth: 1, borderColor: colors.line, borderRadius: layout.radius, backgroundColor: colors.surface, padding: 18 },
  empty: { alignItems: 'center', paddingVertical: 46, paddingHorizontal: 24 }, emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { color: colors.text, fontFamily: fonts.serif, fontSize: 27, textAlign: 'center' }, emptyBody: { color: colors.muted, fontFamily: fonts.sans, fontSize: 13, lineHeight: 21, textAlign: 'center', marginTop: 9, marginBottom: 23, maxWidth: 360 },
  notice: { color: colors.green, backgroundColor: colors.sage, padding: 12, borderRadius: 8, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, marginBottom: 15 },
  noticeError: { color: colors.error, backgroundColor: colors.warm }, divider: { height: 1, backgroundColor: colors.line },
});

import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, Button, Field, Notice, Screen, sharedStyles } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';
import { completeOnboarding } from '@/lib/session';

type Step = 'choose' | 'phone' | 'verify';
export default function SignupScreen() {
  const [step, setStep] = useState<Step>('choose');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const finish = async () => { await completeOnboarding(); router.replace('/(tabs)/records'); };
  const sendCode = () => { const digits = phone.replace(/\D/g, ''); if (digits.length < 7 || digits.length > 15) return setError('Enter a valid phone number.'); setPhone(digits); setError(''); setStep('verify'); };
  const verify = () => { if (!/^\d{6}$/.test(otp)) return setError('Enter the six-digit code.'); finish(); };
  const back = () => { setError(''); if (step === 'choose') router.back(); else setStep(step === 'verify' ? 'phone' : 'choose'); };

  return <Screen contentStyle={styles.content}>
    <View style={styles.header}><Brand/><Pressable onPress={back} style={styles.back}><Ionicons name="arrow-back" size={19} color={colors.muted}/><Text style={styles.backText}>Back</Text></Pressable></View>
    <View style={styles.story}><Text style={styles.kicker}>MAKE YOURSELF AT HOME</Text><Text style={styles.storyTitle}>A little more order.{`\n`}<Text style={styles.em}>A little more ease.</Text></Text><Text style={sharedStyles.body}>Your health records deserve a place of their own.</Text></View>
    <View style={styles.card}>
      {step === 'choose' && <><Text style={styles.label}>WELCOME</Text><Text style={styles.title}>Create your account</Text><Text style={styles.intro}>Let’s bring your records together.</Text><Provider title="Continue with Google" icon="logo-google" onPress={finish}/><Provider title="Continue with Apple" icon="logo-apple" onPress={finish}/><View style={styles.or}><View style={styles.line}/><Text style={styles.orText}>or</Text><View style={styles.line}/></View><Provider title="Continue with phone number" icon="call-outline" onPress={() => setStep('phone')}/></>}
      {step === 'phone' && <><Text style={styles.label}>PHONE NUMBER</Text><Text style={styles.title}>Continue with your phone</Text><Text style={styles.intro}>Enter your number to continue.</Text><Field label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+91 98765 43210"/>{error && <Notice error>{error}</Notice>}<Button title="Continue" icon="arrow-forward" onPress={sendCode}/></>}
      {step === 'verify' && <><Text style={styles.label}>ONE-TIME CODE</Text><Text style={styles.title}>Enter your code</Text><Text style={styles.intro}>Enter the six-digit code for {phone}.</Text><Field label="Verification code" value={otp} onChangeText={value => setOtp(value.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" maxLength={6} placeholder="000000" style={styles.otp}/>{error && <Notice error>{error}</Notice>}<Button title="Continue" icon="arrow-forward" onPress={verify}/></>}
    </View>
    <Text style={styles.foot}>One record at a time. At your own pace.</Text>
  </Screen>;
}

function Provider({ title, icon, onPress }: { title: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.provider, pressed && { opacity: .7 }]}><Ionicons name={icon} size={21} color={colors.text}/><Text style={styles.providerText}>{title}</Text></Pressable>; }

const styles = StyleSheet.create({
  content: { paddingTop: 20 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, back: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 9 }, backText: { color: colors.muted, fontFamily: fonts.sans, fontSize: 12 },
  story: { paddingVertical: 42, gap: 13 }, kicker: sharedStyles.label, storyTitle: { color: colors.text, fontFamily: fonts.serif, fontSize: 36, lineHeight: 43 }, em: { color: colors.green, fontStyle: 'italic' },
  card: { borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 22, backgroundColor: colors.surface, gap: 13 }, label: sharedStyles.label, title: { color: colors.text, fontFamily: fonts.serif, fontSize: 32, marginTop: 3 }, intro: { ...sharedStyles.body, marginBottom: 10 },
  provider: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.surfaceSoft }, providerText: { color: colors.text, fontFamily: fonts.sansMedium, fontSize: 13 },
  or: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 }, line: { height: 1, backgroundColor: colors.line, flex: 1 }, orText: { color: colors.muted, fontSize: 11 }, otp: { fontSize: 23, letterSpacing: 10, textAlign: 'center' }, foot: { color: colors.muted, fontFamily: fonts.serif, fontSize: 15, fontStyle: 'italic', textAlign: 'center', paddingVertical: 28 },
});

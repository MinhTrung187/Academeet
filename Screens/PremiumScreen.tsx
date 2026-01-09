import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import HeaderComponent from '../Component/HeaderComponent';
import BottomNavbar from '../Component/BottomNavbar';
import { useNavigation } from '@react-navigation/native';
import Purchases from 'react-native-purchases';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');

const PACKAGE_DESCRIPTIONS: Record<string, string> = {
  "basic_monthly": "Basic Plan – 100 AI prompts & 30 halfway point location searches per month.",
  "basic_yearly": "Basic Plan – 100 AI prompts & 30 halfway point location searches per year.",
  "plus_monthly": "Plus Plan – 200 AI prompts & 50 halfway point location searches per month.",
  "plus_yearly": "Plus Plan – 200 AI prompts & 30 halfway point location searches per year.",
  "premium_monthly": "Premium Plan – Unlimited AI prompts & halfway point location searches per month.",
  "premium_yearly": "Premium Plan – Unlimited AI prompts & halfway point location searches per year.",
};

const PremiumScreen = () => {
  const navigation: any = useNavigation();
  const [offerings, setOfferings] = useState<any>(null);
  const [activeEntitlement, setActiveEntitlement] = useState<string | null>(null);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  useEffect(() => {

    const fetchOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        console.log('🔍 Offerings:', offerings);
        setOfferings(offerings);
      } catch (error) {
        console.error('❌ Error fetching offerings', error);
      }
    };

    const checkEntitlementStatus = async () => {
      try {
        const purchaserInfo = await Purchases.getCustomerInfo();
        const active = purchaserInfo.entitlements.active;
        const firstKey = Object.keys(active)[0];
        if (firstKey) {
          setActiveEntitlement(firstKey);
          setActiveProductId(active[firstKey].productIdentifier);
          console.log('📦 Active entitlements:', active);
        }
      } catch (error) {
        console.error('❌ Error fetching purchaser info', error);
      }
    };

    fetchOfferings();
    checkEntitlementStatus();
  }, []);

  const purchasePackage = async (pkg: any) => {
    try {
      const purchaseInfo = await Purchases.purchasePackage(pkg);
      const active = purchaseInfo.customerInfo.entitlements.active;
      const activeKey = Object.keys(active)[0] || null;
      if (activeKey) {
        setActiveEntitlement(activeKey);
        setActiveProductId(active[activeKey].productIdentifier);
        Alert.alert('Success', `You're now on the ${activeKey} plan!`);
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert('Error', 'Purchase failed: ' + e.message);
      }
    }

  };

  const sortedPackages = offerings?.current?.availablePackages?.sort(
    (a: any, b: any) => a.product.price - b.product.price
  );
  useEffect(() => {
    const storeSubscription = async () => {
      if (activeEntitlement) {
        const subscriptionTier = activeEntitlement.toLowerCase();
        await SecureStore.setItemAsync("subscription", subscriptionTier);
        console.log("✅ Saved subscription tier:", subscriptionTier);
      }
    };
    storeSubscription();
  }, [activeEntitlement]);


  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#F0F4F8', '#E6EEF5', '#DDE7F0']} style={styles.container}>
          <HeaderComponent />
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.card}>
              {offerings?.current?.serverDescription && (
                <Text style={styles.offeringTitle}>
                  {offerings.current.serverDescription}
                </Text>
              )}

              {activeEntitlement ? (
                <View style={styles.currentPlanBox}>
                  <Text style={styles.currentPlanText}>
                    🎉 You're on the <Text style={styles.currentPlanName}>{activeEntitlement}</Text> plan!
                  </Text>
                  <Text style={styles.currentPlanSubText}>
                    Enjoy all your premium benefits!
                  </Text>
                </View>
              ) : (
                <View style={styles.currentPlanBox}>
                  <Text style={styles.currentPlanText}>
                    🎯 You're on the <Text style={styles.currentPlanName}>Free</Text> plan
                  </Text>
                  <Text style={styles.currentPlanSubText}>
                    Free Plan – 30 AI prompts & 10 halfway point location searches per month.
                  </Text>
                </View>
              )}


              {/* The feature list section has been removed */}

              <View style={styles.plansContainer}>
                {sortedPackages?.length ? (
                  sortedPackages.map((pkg: any, idx: number) => {
                    const isCurrentPlan = pkg.identifier === activeEntitlement || pkg.product.storeProductId === activeProductId;
                    const gradientColors = isCurrentPlan
                      ? ['#60A5FA', '#3B82F6'] as any
                      : ['#60A5FA', '#3B82F6'];

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={styles.planCard}
                        onPress={() => !isCurrentPlan && purchasePackage(pkg)}
                        activeOpacity={isCurrentPlan ? 1 : 0.7}
                        disabled={isCurrentPlan}
                      >
                        <LinearGradient colors={gradientColors} style={styles.planGradient}>
                          <Text style={styles.planTitle}>{pkg.product.title}</Text>
                          <Text style={styles.packageDescription}>
                            {PACKAGE_DESCRIPTIONS[pkg.identifier] ?? "No description available"}
                          </Text>
                          <Text style={styles.price}>{pkg.product.priceString}</Text>
                          <View
                            style={[
                              styles.tryButton,
                              isCurrentPlan && styles.currentPlanButton,
                            ]}
                          >
                            <Text style={styles.tryText}>
                              {isCurrentPlan ? 'Your Current Plan' : 'Choose Plan'}
                            </Text>
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text style={styles.noPackagesText}>No available packages at the moment.</Text>
                )}
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
      <BottomNavbar />
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: '#F0F4F8',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    paddingBottom: 100,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  offeringTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2C3E50',
    marginBottom: 25,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  currentPlanBox: {
    backgroundColor: '#ECFDF5',
    borderColor: '#34D399',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 25,
    alignItems: 'center',
    width: '100%',
  },
  currentPlanText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
    textAlign: 'center',
  },
  currentPlanName: {
    color: '#059669',
  },
  currentPlanSubText: {
    fontSize: 14,
    color: '#065F46',
    marginTop: 5,
    textAlign: 'center',
  },
  upgradePrompt: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 25,
    textAlign: 'center',
  },
  // featureListContainer and featureItem styles have been removed
  plansContainer: {
    width: '100%',
    alignItems: 'center',
  },
  planCard: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 20,
  },
  planGradient: {
    padding: 25,
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  packageDescription: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 20,
  },
  price: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '900',
    marginBottom: 20,
  },
  tryButton: {
    backgroundColor: '#d5dcefff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  currentPlanButton: {
    backgroundColor: '#9CA3AF',
  },
  tryText: {
    color: '#2C3E50',
    fontWeight: '700',
    fontSize: 17,
  },
  noPackagesText: {
    fontSize: 16,
    color: '#607D8B',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default PremiumScreen;
// src/navigation/CustomTabBar.tsx
import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import {
  scale as s,
  scale,
  verticalScale as vs,
} from 'react-native-size-matters';
import { palette } from '../theme';
import JournalModal from '../components/JournalModal';

// --- sizes ---
const BAR_H = vs(74);
const RADIUS = s(26);
const CAP_H = vs(12);
const CAP_INSET = s(18);

// Hex "badge" sizes (this is the IMAGE, not a shape we draw)
const HEX_W = s(100);
const HEX_H = vs(100);
const HEX_RISE = vs(50);

// icons
const ICONS: Record<string, { inactive: ImageSourcePropType }> = {
  Home: { inactive: require('../assets/tabs/Home.png') },
  Search: { inactive: require('../assets/tabs/Search.png') },
  Journal: { inactive: require('../assets/tabs/profile.png') }, // Profile in center hexagon
  setting: { inactive: require('../assets/tabs/setting.png') },

  // Journal tab uses the hexagon polygon IMAGE

  // Empty hexagon (no inner icon)
  hexaIcon: { inactive: require('../assets/tabs/PolygonIcon.png') },
};

type CustomTabBarProps = BottomTabBarProps & {
  onJournalPress: () => void;
  showJournalModal: boolean;
  onCloseJournal: () => void;
};

export default function CustomTabBar({
  state,
  navigation,
  onJournalPress,
  showJournalModal,
  onCloseJournal,
}: CustomTabBarProps) {
  return (
    <>
      <View
        style={[styles.shell, { backgroundColor: palette.darkBlue }]}
        pointerEvents="box-none"
      >
        <View style={styles.shadowWrap}>
          {/* light cap behind bar */}
          <View style={styles.topCapWrap} pointerEvents="none">
            <LinearGradient
              colors={['#7FD0FF', '#49A8FF']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.topCap}
            />
          </View>

          {/* main bar */}
          <View style={styles.barWrap}>
            <LinearGradient
              colors={['#1f5b79ff', '#15283bff', '#090c0fff']}
              locations={[0, 0.55, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.barBG}
            />
            <View style={styles.row}>
              {state.routes.map((route, index) => {
                const focused = state.index === index;
                const isJournalTab = route.name === 'Journal';
                const isCenterProfile = route.name === 'CenterProfile';

                // Don't render the center profile tab in the bar (it's in the hexagon)
                if (isCenterProfile) {
                  return <View key={route.key} style={styles.tabBtn} />;
                }

                return (
                  <TouchableOpacity
                    key={route.key}
                    style={styles.tabBtn}
                    onPress={() => {
                      if (isJournalTab) {
                        // Open journal modal instead of navigating
                        onJournalPress();
                      } else if (!focused) {
                        navigation.navigate(route.name as never);
                      }
                    }}
                  >
                    <Image
                      source={ICONS[route.name]?.inactive}
                      style={[
                        styles.icon,
                        {
                          tintColor: focused
                            ? '#8EDAFF'
                            : 'rgba(255,255,255,0.92)',
                        },
                      ]}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* centered hex IMAGE - now clickable, no inner icon */}
          <TouchableOpacity
            style={styles.hexWrap}
            onPress={() => {
              const centerProfileIndex = state.routes.findIndex(
                r => r.name === 'CenterProfile',
              );
              if (centerProfileIndex !== -1) {
                navigation.navigate('CenterProfile' as never);
              }
            }}
          >
            <Image
              source={ICONS.hexaIcon.inactive}
              style={styles.hexImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Journal Modal - only shows journal view */}
      <JournalModal visible={showJournalModal} onClose={onCloseJournal} />
    </>
  );
}

const styles = StyleSheet.create({
  shell: {},
  shadowWrap: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 18,
  },

  // cap
  topCapWrap: {
    position: 'absolute',
    left: CAP_INSET,
    right: CAP_INSET,
    top: -CAP_H / 2,
    height: CAP_H,
    zIndex: 0,
  },
  topCap: {
    flex: 1,
    borderTopLeftRadius: s(16),
    borderTopRightRadius: s(16),
    borderBottomLeftRadius: s(5),
    borderBottomRightRadius: s(5),
  },

  // bar
  barWrap: {
    borderRadius: RADIUS,
    overflow: 'hidden',
    zIndex: 1,
  },
  barBG: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS,
  },
  row: {
    height: scale(70),
    // paddingHorizontal: s(28),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabBtn: {
    width: s(64),
    height: vs(44),
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { width: s(18), height: s(18) },
  journalIcon: { width: s(32), height: s(32) }, // Bigger for the hexagon icon

  hexWrap: {
    position: 'absolute',
    alignSelf: 'center',
    top: -HEX_RISE,
    width: HEX_W,
    height: HEX_H,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  hexImage: {
    width: HEX_W,
    height: HEX_H,
  },
});

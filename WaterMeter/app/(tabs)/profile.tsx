import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, Dimensions } from 'react-native';
import { Svg, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.5; 
const STROKE_WIDTH = 20;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = RADIUS * 2 * Math.PI;

export default function Home() {
  const percentage = 67;
  const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * percentage) / 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Water Meter</Text>
      </View>

      <View style={styles.factSection}>
        <Text style={styles.factHeader}>Water fact of the day:</Text>
        <View style={styles.factCard}>
          <Text style={styles.factText}>
            Water could be the key to finding life.
          </Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.intakeTitle}>Today's Intake</Text>
        
        <View style={styles.chartContainer}>
          <View style={styles.outerCircle}>
            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
              <Circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke="#D9D9D9"
                strokeWidth={STROKE_WIDTH}
                fill="none"
              />
              <Circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke="#00CFFF"
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
              />
            </Svg>
            
            <View style={styles.percentageWrapper}>
              <Text style={styles.percentageText}>{percentage}%</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A3D2F7',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 36,
    color: '#555555',
    fontWeight: '500',
  },
  factSection: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  factHeader: {
    color: '#4A7C8C',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 15,
  },
  factCard: {
    backgroundColor: '#F0F8FF',
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  factText: {
    textAlign: 'center',
    fontSize: 20,
    color: '#4A7C8C',
    lineHeight: 26,
  },
  progressSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intakeTitle: {
    fontSize: 22,
    color: '#557A89',
    marginBottom: 20,
    fontWeight: '500',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    width: CIRCLE_SIZE + 30,
    height: CIRCLE_SIZE + 30,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: (CIRCLE_SIZE + 30) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageWrapper: {
    position: 'absolute',
  },
  percentageText: {
    fontSize: 42,
    color: '#557A89',
    fontWeight: '400',
  },
});
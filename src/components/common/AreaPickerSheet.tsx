import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '../ui/BottomSheet';
import { Text } from '../ui/Text';
import { areasService } from '../../services/api';
import { Area } from '../../types/domain';
import { useLocation } from '../../features/location/useLocation';
import { theme } from '../../theme';

export interface AreaPickerSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const AreaPickerSheet: React.FC<AreaPickerSheetProps> = ({ visible, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { setSelectedArea, requestLocation, requesting, mode, selectedArea } = useLocation();

  const { data: areas, isLoading } = useQuery({
    queryKey: ['areas'],
    queryFn: () => areasService.getAreas(),
  });

  const handleUseCurrentLocation = async () => {
    await requestLocation();
    onClose();
  };

  const handleSelectArea = (area: Area) => {
    setSelectedArea(area);
    onClose();
  };

  const filteredAreas = useMemo(() => {
    if (!areas) return [];
    if (!searchQuery.trim()) return areas;
    const q = searchQuery.toLowerCase();
    return areas.filter((a) => a.name.toLowerCase().includes(q));
  }, [areas, searchQuery]);

  const groupedAreas = useMemo(() => {
    const groups: Record<string, Area[]> = {
      'F Sectors': [],
      'G Sectors': [],
      'E Sectors': [],
      'I Sectors': [],
      'Commercial & Suburbs': [],
    };

    filteredAreas.forEach((area) => {
      const name = area.name.toUpperCase();
      if (name.startsWith('F-')) groups['F Sectors'].push(area);
      else if (name.startsWith('G-')) groups['G Sectors'].push(area);
      else if (name.startsWith('E-')) groups['E Sectors'].push(area);
      else if (name.startsWith('I-')) groups['I Sectors'].push(area);
      else groups['Commercial & Suburbs'].push(area);
    });

    return Object.entries(groups).filter(([_, list]) => list.length > 0);
  }, [filteredAreas]);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Select Location">
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={theme.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search F-7, Blue Area, DHA..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {/* GPS Location Option */}
          <TouchableOpacity
            style={[styles.locationOption, mode === 'gps' && styles.selectedOption]}
            onPress={handleUseCurrentLocation}
            disabled={requesting}
            activeOpacity={0.7}
          >
            <View style={styles.gpsIconCircle}>
              {requesting ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Ionicons name="navigate-outline" size={20} color={theme.colors.primary} />
              )}
            </View>
            <View style={styles.optionText}>
              <Text variant="subtitle" color={theme.colors.primary} style={styles.gpsTitle}>
                Use Current GPS Location
              </Text>
              <Text variant="caption" color={theme.colors.textMuted}>
                Find nearest deals automatically
              </Text>
            </View>
            {mode === 'gps' ? (
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
            ) : null}
          </TouchableOpacity>

          {/* Grouped Areas */}
          {isLoading ? (
            <ActivityIndicator style={{ marginVertical: 20 }} color={theme.colors.primary} />
          ) : (
            groupedAreas.map(([groupTitle, areaList]) => (
              <View key={groupTitle} style={styles.groupContainer}>
                <Text variant="caption" color={theme.colors.textMuted} style={styles.groupHeader}>
                  {groupTitle.toUpperCase()}
                </Text>
                {areaList.map((area) => {
                  const isSelected = mode === 'area' && selectedArea?.id === area.id;
                  return (
                    <TouchableOpacity
                      key={area.id}
                      style={[styles.areaItem, isSelected && styles.selectedAreaItem]}
                      onPress={() => handleSelectArea(area)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="location-outline"
                        size={18}
                        color={isSelected ? theme.colors.primary : theme.colors.textMuted}
                        style={styles.areaIcon}
                      />
                      <Text
                        variant="body"
                        color={isSelected ? theme.colors.primary : theme.colors.text}
                        style={[styles.areaName, isSelected && styles.boldAreaName]}
                      >
                        {area.name}
                      </Text>
                      {isSelected ? (
                        <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 480,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.chip,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    height: 44,
    marginBottom: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 14,
    color: theme.colors.text,
  },
  scrollArea: {
    maxHeight: 400,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: '#FFF0EA',
    borderRadius: theme.radii.button,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#FFD4C2',
  },
  selectedOption: {
    borderColor: theme.colors.primary,
  },
  gpsIconCircle: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  optionText: {
    flex: 1,
  },
  gpsTitle: {
    fontWeight: '700',
  },
  groupContainer: {
    marginBottom: theme.spacing.md,
  },
  groupHeader: {
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  areaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.sm,
  },
  selectedAreaItem: {
    backgroundColor: theme.colors.surface,
  },
  areaIcon: {
    marginRight: theme.spacing.sm,
  },
  areaName: {
    flex: 1,
  },
  boldAreaName: {
    fontWeight: '700',
  },
});

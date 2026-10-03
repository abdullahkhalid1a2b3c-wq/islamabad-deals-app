export type Weekday =
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface TimeSlot {
  open: string; // "HH:mm" 24-hour format e.g. "12:00"
  close: string; // "HH:mm" 24-hour format e.g. "02:00" (supports overnight)
}

export type DayOpeningHours = TimeSlot[] | null; // null or empty array indicates closed
export type OpeningHours = Partial<Record<Weekday, DayOpeningHours>>;

export type PriceRange = 1 | 2 | 3 | 4;

export type DealType =
  'bogo' | 'percent_off' | 'fixed_price' | 'free_delivery' | 'happy_hour' | 'student_discount';

export type ServiceMode = 'dine_in' | 'takeaway' | 'delivery';

export interface Area {
  id: string;
  name: string;
  city: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  pricePKR: number; // Integer PKR
  imageUrl?: string;
  isAvailable: boolean;
}

export interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

export interface RestaurantSummary {
  id: string;
  name: string;
  logoUrl: string;
  coverUrl?: string;
  areaName: string;
  rating: number;
  reviewCount: number;
  cuisine: string[];
  priceRange: PriceRange;
  distanceM?: number;
  openingHours: OpeningHours;
}

export interface Restaurant extends RestaurantSummary {
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  phone: string;
  serviceModes: ServiceMode[];
  menuSections?: MenuSection[];
}

export interface DealRestaurantSummary {
  id: string;
  name: string;
  logoUrl: string;
  areaName: string;
  distanceM?: number;
}

export interface DealSummary {
  id: string;
  title: string;
  description: string;
  dealType: DealType;
  discountValue?: number; // percentage (e.g. 30 for 30% off)
  originalPricePKR?: number; // Integer PKR
  dealPricePKR: number; // Integer PKR
  imageUrl: string;
  startDate: string; // ISO String
  endDate: string; // ISO String
  dailyStartTime?: string; // "HH:mm" e.g. "16:00"
  dailyEndTime?: string; // "HH:mm" e.g. "19:00"
  daysOfWeek?: Weekday[];
  isFeatured?: boolean;
  isExclusive?: boolean;
  restaurant: DealRestaurantSummary;
}

export interface Deal extends DealSummary {
  termsAndConditions: string[];
  serviceModes: ServiceMode[];
  maxRedemptionsPerUser?: number;
  totalRedemptions?: number;
  code?: string;
}

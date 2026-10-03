import React from 'react';
import { DealType } from '../../types/domain';
import { Badge, BadgeProps } from '../ui/Badge';
import { formatPKR } from '../../utils/price';

export interface DealBadgeProps extends Omit<BadgeProps, 'label'> {
  dealType: DealType;
  discountValue?: number;
  dealPricePKR?: number;
}

export const DealBadge: React.FC<DealBadgeProps> = ({
  dealType,
  discountValue,
  dealPricePKR,
  variant,
  ...props
}) => {
  const getLabel = (): string => {
    switch (dealType) {
      case 'bogo':
        return 'BUY 1 GET 1 FREE';
      case 'percent_off':
        return discountValue ? `${discountValue}% OFF` : 'OFFER';
      case 'fixed_price':
        return dealPricePKR ? formatPKR(dealPricePKR) : 'SPECIAL PRICE';
      case 'free_delivery':
        return 'FREE DELIVERY';
      case 'happy_hour':
        return 'HAPPY HOUR';
      case 'student_discount':
        return 'STUDENT DISCOUNT';
      default:
        return 'DEAL';
    }
  };

  const getVariant = () => {
    if (variant) return variant;
    if (dealType === 'bogo' || dealType === 'percent_off') return 'discount' as const;
    if (dealType === 'happy_hour' || dealType === 'student_discount') return 'featured' as const;
    return 'discount' as const;
  };

  return <Badge label={getLabel()} variant={getVariant()} {...props} />;
};

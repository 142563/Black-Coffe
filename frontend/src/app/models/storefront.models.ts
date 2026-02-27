export interface StorefrontSocialLinks {
  instagram: string;
  facebook: string;
}

export interface StorefrontSettings {
  name: string;
  tagline: string;
  logoUrl: string;
  accentColor: string;
  phone: string;
  whatsapp: string;
  address: string;
  hoursText: string;
  businessMessage: string;
  socialLinks: StorefrontSocialLinks;
}

export interface StorefrontBanner {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  type: string;
  active: boolean;
  order: number;
}

export interface MenuCategory {
  key: string;
  name: string;
  iconKey: string;
  order: number;
  visible: boolean;
}

export interface FeaturedMenuItem {
  id: number;
  name: string;
  categoryKey: string;
  priceFrom: number;
  badgeText: string;
  imageUrl: string;
}

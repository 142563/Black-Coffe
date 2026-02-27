import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import {
  FeaturedMenuItem,
  MenuCategory,
  StorefrontBanner,
  StorefrontSettings
} from '../../models/storefront.models';

@Injectable({ providedIn: 'root' })
export class StorefrontService {
  constructor(private readonly api: ApiService) {}

  getSettings(): Promise<StorefrontSettings> {
    return this.api.get<StorefrontSettings>('/api/storefront/settings');
  }

  getBanners(): Promise<StorefrontBanner[]> {
    return this.api.get<StorefrontBanner[]>('/api/storefront/banners');
  }

  getMenuCategories(): Promise<MenuCategory[]> {
    return this.api.get<MenuCategory[]>('/api/menu/categories');
  }

  getFeatured(): Promise<FeaturedMenuItem[]> {
    return this.api.get<FeaturedMenuItem[]>('/api/menu/featured');
  }
}

const BASE_URL = 'https://ph-locations-api.buonzz.com/v1';

export interface PHRegion {
  id: number;
  name: string;
  region_code: string;
}

export interface PHProvince {
  id: number;
  name: string;
  province_code: string;
  region_code: string;
}

export interface PHCity {
  id: number;
  name: string;
  city_code: string;
  province_code: string;
}

export interface PHBarangay {
  id: number;
  name: string;
  barangay_code: string;
  city_code: string;
}

class PHLocationsAPI {
  private async fetchFromAPI<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data as T;
  }

  async getRegions(): Promise<PHRegion[]> {
    return this.fetchFromAPI<PHRegion[]>('/regions');
  }

  async getProvinces(regionCode?: string): Promise<PHProvince[]> {
    const query = regionCode ? `?region_code=${regionCode}` : '';
    return this.fetchFromAPI<PHProvince[]>(`/provinces${query}`);
  }

  async getCities(provinceCode?: string): Promise<PHCity[]> {
    const query = provinceCode ? `?province_code=${provinceCode}` : '';
    return this.fetchFromAPI<PHCity[]>(`/cities${query}`);
  }

  async getBarangays(cityCode?: string): Promise<PHBarangay[]> {
    const query = cityCode ? `?city_code=${cityCode}` : '';
    return this.fetchFromAPI<PHBarangay[]>(`/barangays${query}`);
  }
}

export const phLocationsAPI = new PHLocationsAPI(); 
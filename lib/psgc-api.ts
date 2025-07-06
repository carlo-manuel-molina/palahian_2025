// PSGC API Service for Philippine address data
// Based on https://psgc.gitlab.io/api/

const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

export interface PSGCRegion {
  code: string;
  name: string;
  regionName: string;
  islandGroupCode?: string;
  psgc10DigitCode?: string;
}

export interface PSGCProvince {
  code: string;
  name: string;
  regionCode: string;
  islandGroupCode?: string;
  psgc10DigitCode?: string;
}

export interface PSGCCityOrMunicipality {
  code: string;
  name: string;
  oldName?: string;
  isCapital?: boolean;
  provinceCode: string;
  districtCode?: string | boolean;
  regionCode: string;
  islandGroupCode?: string;
  psgc10DigitCode?: string;
}

export interface PSGCBarangay {
  code: string;
  name: string;
  oldName?: string;
  cityCode: string;
  municipalityCode?: string;
  provinceCode: string;
  regionCode: string;
  islandGroupCode?: string;
  psgc10DigitCode?: string;
}

class PSGCAPIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'PSGCAPIError';
  }
}

class PSGCAPIService {
  private async fetchFromAPI<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${PSGC_BASE_URL}${endpoint}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'palahian.com/1.0'
        },
        // Add timeout and follow redirects
        signal: AbortSignal.timeout(10000), // 10 seconds
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new PSGCAPIError(`HTTP ${response.status}: ${response.statusText}`, response.status);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof PSGCAPIError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new PSGCAPIError('Request timeout');
      }
      throw new PSGCAPIError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get all regions
  async getRegions(): Promise<PSGCRegion[]> {
    return this.fetchFromAPI<PSGCRegion[]>('/regions.json');
  }

  // Get all provinces
  async getProvinces(): Promise<PSGCProvince[]> {
    return this.fetchFromAPI<PSGCProvince[]>('/provinces.json');
  }

  // Get provinces in a specific region
  async getProvincesByRegion(regionCode: string): Promise<PSGCProvince[]> {
    return this.fetchFromAPI<PSGCProvince[]>(`/regions/${regionCode}/provinces.json`);
  }

  // Get all cities/municipalities
  async getCities(): Promise<PSGCCityOrMunicipality[]> {
    return this.fetchFromAPI<PSGCCityOrMunicipality[]>('/cities.json');
  }

  // Get cities in a specific province
  async getCitiesByProvince(provinceCode: string): Promise<PSGCCityOrMunicipality[]> {
    console.log('PSGC API: Fetching cities for province:', provinceCode);
    const result = await this.fetchFromAPI<PSGCCityOrMunicipality[]>(`/provinces/${provinceCode}/cities.json`);
    console.log('PSGC API: Cities result length:', result?.length || 0);
    return result;
  }

  // Get all barangays
  async getBarangays(): Promise<PSGCBarangay[]> {
    return this.fetchFromAPI<PSGCBarangay[]>('/barangays.json');
  }

  // Get barangays in a specific city
  async getBarangaysByCity(cityCode: string): Promise<PSGCBarangay[]> {
    return this.fetchFromAPI<PSGCBarangay[]>(`/cities/${cityCode}/barangays.json`);
  }

  // Get a specific region by code
  async getRegion(regionCode: string): Promise<PSGCRegion> {
    return this.fetchFromAPI<PSGCRegion>(`/regions/${regionCode}.json`);
  }

  // Get a specific province by code
  async getProvince(provinceCode: string): Promise<PSGCProvince> {
    return this.fetchFromAPI<PSGCProvince>(`/provinces/${provinceCode}.json`);
  }

  // Get a specific city by code
  async getCity(cityCode: string): Promise<PSGCCityOrMunicipality> {
    return this.fetchFromAPI<PSGCCityOrMunicipality>(`/cities/${cityCode}.json`);
  }

  // Get a specific barangay by code
  async getBarangay(barangayCode: string): Promise<PSGCBarangay> {
    return this.fetchFromAPI<PSGCBarangay>(`/barangays/${barangayCode}.json`);
  }

  // Search functionality
  async searchRegions(query: string): Promise<PSGCRegion[]> {
    const regions = await this.getRegions();
    return regions.filter(region => 
      region.name.toLowerCase().includes(query.toLowerCase()) ||
      region.regionName.toLowerCase().includes(query.toLowerCase())
    );
  }

  async searchProvinces(query: string): Promise<PSGCProvince[]> {
    const provinces = await this.getProvinces();
    return provinces.filter(province => 
      province.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  async searchCities(query: string): Promise<PSGCCityOrMunicipality[]> {
    const cities = await this.getCities();
    return cities.filter(city => 
      city.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  async searchBarangays(query: string): Promise<PSGCBarangay[]> {
    const barangays = await this.getBarangays();
    return barangays.filter(barangay => 
      barangay.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Get municipalities in a specific province
  async getMunicipalitiesByProvince(provinceCode: string): Promise<PSGCCityOrMunicipality[]> {
    return this.fetchFromAPI<PSGCCityOrMunicipality[]>(`/provinces/${provinceCode}/municipalities.json`);
  }

  async getAllCitiesAndMunicipalitiesByProvince(provinceCode: string): Promise<PSGCCityOrMunicipality[]> {
    const [cities, municipalities] = await Promise.all([
      this.getCitiesByProvince(provinceCode),
      this.getMunicipalitiesByProvince(provinceCode),
    ]);
    return [...cities, ...municipalities].sort((a, b) => a.name.localeCompare(b.name));
  }

  async getBarangaysByCityOrMunicipality(code: string): Promise<PSGCBarangay[]> {
    // Try city endpoint first
    try {
      const cityResult = await this.fetchFromAPI<PSGCBarangay[]>(`/cities/${code}/barangays.json`);
      if (Array.isArray(cityResult) && cityResult.length > 0) {
        return cityResult;
      }
    } catch (error: any) {
      // Ignore 404, try municipality next
      if (!error.message || !error.message.includes('HTTP 404')) {
        throw error;
      }
    }
    // Try municipality endpoint
    try {
      const muniResult = await this.fetchFromAPI<PSGCBarangay[]>(`/municipalities/${code}/barangays.json`);
      if (Array.isArray(muniResult)) {
        return muniResult;
      }
    } catch (error: any) {
      if (!error.message || !error.message.includes('HTTP 404')) {
        throw error;
      }
    }
    // If both fail or are empty, return []
    return [];
  }
}

// Export singleton instance
export const psgcAPI = new PSGCAPIService();
export { PSGCAPIError }; 
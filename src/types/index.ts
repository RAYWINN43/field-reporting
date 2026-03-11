export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Incident {
    id?: string;
    photoUri: string | null;
    location: Coordinates | null;
    timestamp: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface LocationMapProps {
    onLocationFound: (coords: Coordinates) => void;
}
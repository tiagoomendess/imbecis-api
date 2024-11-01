

export interface HeatMapResponse {
    coordinates: HeatMapCoordinate[];
}

export interface HeatMapCoordinate {
    latitude: number;
    longitude: number;
    intensity?: number;
}

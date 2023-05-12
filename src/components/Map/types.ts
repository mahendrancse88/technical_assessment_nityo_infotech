export interface GoogleMapProps {
  apiKey: string;
  height: string;
  searchPlaceHolder?: string;
  overridePlace?: BasePlaceResult;
  onPlaceChanged?: (placeResult: PlaceResult) => void;
}

export interface BasePlaceResult {
  description: string;
  place_id: string;
}

export interface PlaceResult extends BasePlaceResult {
  matched_substrings: {
    length: number;
    offset: number;
  }[],
  reference: string;
  types: string[]
}
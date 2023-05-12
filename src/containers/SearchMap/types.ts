import { Action, PayloadedAction } from '@common/types';
import { BasePlaceResult } from '@components/Map/types';

export type HistoryPlaceResult = BasePlaceResult;
export type InterestPlaceResult = BasePlaceResult;

export interface SearchMapState {
  searchHistoryPlaces: HistoryPlaceResult[];
  interestPlaces: InterestPlaceResult[];
  isInterestPlacesLoading: boolean;
  interestPlacesLoadError: string;
}

export type SearchMapActions = 
| PayloadedAction<'ON_MAP_PLACE_SEARCHED', HistoryPlaceResult>
| Action<'ON_RESET'>
| Action<'POPULATE_INTEREST_PLACE_INPROGRESS'>
| PayloadedAction<'POPULATE_INTEREST_PLACE', InterestPlaceResult[]>
| Action<'POPULATE_INTEREST_PLACE_COMPLETED'>
| PayloadedAction<'POPULATE_INTEREST_PLACE_ERROR', string>
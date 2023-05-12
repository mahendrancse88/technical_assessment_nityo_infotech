import { RootState } from '@store/redux';
import { ThunkDispatch } from 'redux-thunk';
import { HistoryPlaceResult, SearchMapActions } from './types';
import GooglePlacesMockData from '~/mocks/google-places';
import { delay } from '~/utils/asyncHelper';

export const onMapPlacedSearched = 
(result: HistoryPlaceResult) : SearchMapActions => ({type: 'ON_MAP_PLACE_SEARCHED', payload: result})

export const resetPlaces = () : SearchMapActions => ({ type: 'ON_RESET' })

/* 
* This project doesn't call to any async API request.
* Since this is required to showcase in technical assessment, I'll just show an example here if there's one.
* To be more practical, I will use this set of data as places of interest.
* Using delay as for it were look alike fetches from a real server
*/
export const populateInterestPlaces = 
() => async (dispatch: ThunkDispatch<RootState, void, SearchMapActions>) => {
  dispatch({ type: 'POPULATE_INTEREST_PLACE_INPROGRESS' });
  try {
    const data = await delay(GooglePlacesMockData);
    dispatch({ type: 'POPULATE_INTEREST_PLACE', payload: data });
  } catch (err) {
    dispatch({ type: 'POPULATE_INTEREST_PLACE_ERROR', payload: err.toString() });
  } finally {
    dispatch({ type: 'POPULATE_INTEREST_PLACE_COMPLETED' });
  }
}
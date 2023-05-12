import { SearchMapActions, SearchMapState } from './types';

const initialState: SearchMapState = {
  searchHistoryPlaces: [],
  interestPlaces: [],
  isInterestPlacesLoading: false,
  interestPlacesLoadError: '',
}

export default (state = initialState, action: SearchMapActions) : SearchMapState => {
  switch (action.type) {

  case 'ON_MAP_PLACE_SEARCHED': {
    const hist = [action.payload, ...state.searchHistoryPlaces];
    if (hist.length > 5)
      hist.length = 5;
    return {
      ...state,
      searchHistoryPlaces: hist
    }
  }

  case 'POPULATE_INTEREST_PLACE_INPROGRESS':
    return { 
      ...state, 
      isInterestPlacesLoading: true
    }

  case 'POPULATE_INTEREST_PLACE':
    return { 
      ...state, 
      interestPlaces: action.payload
    }

  case 'POPULATE_INTEREST_PLACE_COMPLETED':
    return {
      ...state,
      isInterestPlacesLoading: false
    }

  case 'POPULATE_INTEREST_PLACE_ERROR':
    return {
      ...state,
      interestPlacesLoadError: ''
    }

  default:
    return state
  }
}

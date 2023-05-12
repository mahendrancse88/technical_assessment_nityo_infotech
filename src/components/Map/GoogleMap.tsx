import React, { useState, useEffect, useRef, useCallback, FunctionComponent } from 'react';
import PropTypes from 'prop-types';
import { Paper, IconButton, InputBase, List, ListItem, ListItemText, makeStyles, CircularProgress } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import useScript from '@hooks/useScript';
import { GoogleMapProps, PlaceResult } from './types';
import useOnClickedOutside from '@hooks/useOnClickOutside';

const useStyles = makeStyles<any, { height: string }>(() => ({
  map: {
    height: props => props.height,
    width: '100%',
    borderRadius: '12px',
    boxShadow: '0 0 8px 2px rgba(22, 22, 22, 0.1)',
    '& .gmnoprint': {
      display: 'none',
    },
  },
  mapOverlay: {
    position: 'fixed',
  },
  controlArea: {
    width: '90%',
    marginTop: '14px',
    borderRadius: '12px',
    boxSizing: 'border-box',
    outline: 'none',
    boxShadow: '0 0 12px 4px rgba(22, 22, 22, 0.2)',
    backgroundColor: '#eee',
    fontFamily: 'Roboto'
  },
  querySection: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  queryInput: {
    flex: 1,
    paddingRight: 12,
  },
  searchIconButton: {
    padding: 10,
  },
  resultList: {
    backgroundColor: '#eee',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  resultListItem: {
    borderBottom: '1px solid lightgrey',
    '&:last-child': {
      borderBottom: 0
    }
  },
  loadingIcon: {
    width: '24px !important',
    height: '24px !important'
  }
}));

const GoogleMap: FunctionComponent<GoogleMapProps> = ({
  apiKey,
  height, 
  overridePlace, 
  searchPlaceHolder = '',
  onPlaceChanged = () => {}, 
}) => {
  const [ scriptHasLoaded ] = useScript(`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`, 'google');
  const classes = useStyles({
    height
  });

  const queryTimeoutRef = useRef<number>(null); 
  const mapRef = useRef<google.maps.Map<HTMLElement>>(null);
  const markerRef = useRef<google.maps.Marker>(null);
  const autoCompleteServiceRef = useRef<google.maps.places.AutocompleteService>(null);
  const placeServiceRef = useRef<google.maps.places.PlacesService>(null);
  const queryInputRef = useRef<HTMLInputElement>();
  const searchControlRef = useRef<HTMLDivElement>();
  
  const [, setHasMapLoaded ] = useState(false);
  const [ searchQuery, setSearchQuery ] = useState('');
  const [ searchResults, setSearchResults ] = useState<PlaceResult[]>([]);
  const [ showSearchResults, setShowSearchResults ] = useState(false);
  const [, setSearchResultSelectedIndex ] = useState<number>(undefined);
  const [ placeName ] = useState('');
  const [ placeAddress ] = useState('');
  const [ isPlaceDetailLoading, setIsPlaceDetailLoading ] = useState(false);

  const initMap = () => {
    /* Init Google Map */
    const googlemaps = window.google.maps;
    const map = new googlemaps.Map(document.getElementById('map'), {
      // West Malaysia center bu default
      center: { lat: 4.5312679, lng: 102.3000685},
      disableDefaultUI: true,
      zoom: 6,
    });
    mapRef.current = map;

    /* Google Map Events */
    googlemaps.event.addListenerOnce(map, 'tilesloaded', function() {
      setHasMapLoaded(true);
    });

    googlemaps.event.addListener(map, 'click', function() {
      setShowSearchResults(false);
    });
    googlemaps.event.addListener(map, 'drag', function() {
      setShowSearchResults(false);
    });

    /* Embedding our component into google map view */
    const card = document.getElementById('search-control');
    map.controls[googlemaps.ControlPosition.TOP_CENTER].push(card);

    /* Make info window for current search location */
    const infowindow = new googlemaps.InfoWindow();
    const infowindowContent = document.getElementById('infowindow-content');
    infowindow.setContent(infowindowContent);

    /* Make marker to pinpoint current location */
    const marker = new googlemaps.Marker({
      map,
      anchorPoint: new googlemaps.Point(0, -29),
    });
    markerRef.current = marker;
  }

  const onDisplaySuggestionResult = (predictions, status) => {
    if (status != window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
      console.error(status);
      return;
    }
    setShowSearchResults(true);
    setSearchResults(predictions);
  };

  const getPlaceDetailAndMarkOnMap = (placeId: string) => {
    const marker = markerRef.current;
    marker.setVisible(false);
    setIsPlaceDetailLoading(true);

    placeServiceRef.current.getDetails({
      placeId
    }, (res, status) => {
      setIsPlaceDetailLoading(false);

      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const geo = res.geometry,
        map = mapRef.current;

        if (!geo || !geo.location) {
          window.alert('No place details available');
          return;
        }

        // If this place has a viewport definition, set it on map.
        if (geo.viewport) {
          mapRef.current.fitBounds(geo.viewport);
        } else {
          map.setCenter(geo.location);
          map.setZoom(10);
        }

        marker.setPosition(geo.location);
        marker.setVisible(true);
      } else {
        alert('Failed to get place detail.');
      }
    });
  }

  const getPredictionByQueryInput = (query: string) => {

    if (queryTimeoutRef && queryTimeoutRef.current) {
      clearTimeout(queryTimeoutRef.current);
    }
    
    queryTimeoutRef.current = setTimeout(() => {
      /* Query validation */
      if (!query || query.length < 3) {
        setSearchResults([]);
        return;
      }

      autoCompleteServiceRef.current.getPlacePredictions({ 
        input: query,
        componentRestrictions: { country: 'my' },
      }, onDisplaySuggestionResult);
    }, 1000) as unknown as number;
  }

  const onPredictionListItemSelected
  : (predictionIndex: number) => React.MouseEventHandler<HTMLDivElement> 
  = (predictionIndex) => () => {
    setSearchResultSelectedIndex(predictionIndex);

    const selectedPlace = searchResults[predictionIndex];
    setSearchQuery(selectedPlace.description);
    setShowSearchResults(false);
    getPlaceDetailAndMarkOnMap(selectedPlace.place_id);
    onPlaceChanged(selectedPlace);
  }

  const onQueryInputChanged = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);
    getPredictionByQueryInput(query);
  }, [getPredictionByQueryInput]);

  const onQueryInputClicked = () => {
    setShowSearchResults(true);
  }

  const onQueryInputSubmitted: React.FormEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
  }

  useOnClickedOutside(searchControlRef, () => {
    setShowSearchResults(false);
  });

  useEffect(() => {
    if (scriptHasLoaded) {
      initMap();
      
      // Init Services
      autoCompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      placeServiceRef.current = new window.google.maps.places.PlacesService(document.getElementById('placeAttrId') as HTMLDivElement);
    }
  }, [scriptHasLoaded])

  useEffect(() => {
    if (!overridePlace) return;
    const selectedPlace = overridePlace;
    setSearchQuery(selectedPlace.description);
    setShowSearchResults(false);
    getPlaceDetailAndMarkOnMap(selectedPlace.place_id);
  }, [overridePlace])

  useEffect(() => {
    if (!apiKey)
      alert('Make sure you have your google API KEY set in src/configs file.');
  }, [apiKey])

  return (
    <div>
      <div className={classes.map}>
        <div className={classes.mapOverlay}>
          <div ref={searchControlRef} className={classes.controlArea} id="search-control" style={{ display: 'block' }}>
            <Paper component="form" className={classes.querySection} onSubmit={onQueryInputSubmitted}>
              <IconButton disabled type="submit" className={classes.searchIconButton} aria-label="search">
              { 
                isPlaceDetailLoading 
                ? <CircularProgress className={classes.loadingIcon} />
                : <SearchIcon />
              }
              </IconButton>
              <InputBase
                inputRef={queryInputRef}
                className={classes.queryInput}
                onChange={onQueryInputChanged}
                value={searchQuery}
                disabled={isPlaceDetailLoading}
                onClick={onQueryInputClicked}
                placeholder={searchPlaceHolder}
                inputProps={{ 'aria-label': 'Search Google Maps' }}
                />
            </Paper>
            {
              searchResults.length > 0 && showSearchResults
              &&
              <List dense component="div" aria-label="location search result list" className={classes.resultList}>
              {
                searchResults.map((r, i) => (
                  <ListItem key={r.place_id} dense button className={classes.resultListItem} onClick={onPredictionListItemSelected(i)}>
                    <ListItemText primary={r.description} />
                  </ListItem>
                ))
              }
              </List>
            }
          </div>
          <div id="infowindow-content">
            <span>{placeName}</span>
            <br />
            <span>{placeAddress}</span>
          </div>
        </div>
        <div id="map" className={classes.map} />
        <div id="placeAttrId" />
      </div>
    </div>
  )
}

GoogleMap.displayName = 'Google Map Component'
GoogleMap.propTypes = {
  apiKey: PropTypes.string.isRequired
};


export { GoogleMap }
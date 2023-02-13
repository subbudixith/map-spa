import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { debounce, get } from "lodash";
import React, { useRef } from "react";
import { Map, Marker, Popup, TileLayer } from "react-leaflet";
import Search from "react-leaflet-search";
import { useDispatch, useSelector } from "react-redux";
import { visitorIcon } from "../../../constants";
import { updateLocation } from "../../../store/App/app.actions";
import "./index.scss";

const provider = new OpenStreetMapProvider();
const defaultCenter = [1.2858644, 103.85254594021382];
const defaultZoom = 14;

/**
 *  Pop-up Component to display selected location
 * @param SearchInfo {Object} Selected location data
 */
const customPopup = (SearchInfo) => {
  return (
    <Popup>
      <div>
        <p>{SearchInfo.info}</p>
        <p>{SearchInfo.raw && SearchInfo.raw.place_id && JSON.stringify(SearchInfo.raw.place_id)}</p>
      </div>
    </Popup>
  );
};

/**
 *  Locate Component
 * @description Autocomplete to find places and show at map
 */
function Locate() {
  const dispatch = useDispatch();
  const mapRef = useRef();

  const [position, setPosition] = React.useState(null);
  const [quickList, setQuickList] = React.useState([]);
  const [value, setValue] = React.useState(null);
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState([]);

  /**
   *  Get Selected Location
   * @description Fetch selected location from store
   */
  const currentLocation = useSelector((state) => {
    return get(state, "app.location", null);
  });

  /**
   *  Update user Location
   * @description  Onload locate user location
   */
  React.useEffect(() => {
    const { current = {} } = mapRef;
    const { leafletElement: map } = current;

    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, []);

  /**
   *  Fetch places
   * @description Fetch Results based on user input
   */
  const getResults = async (query, callback) => {
    const results = await provider.search({ query: query.input });
    callback(results);
  };

  /**
   *  Go to Selected place
   * @description  Upon location selection map pointed to selected location
   */
  const handleOnFlyTo = (data) => {
    const { current = {} } = mapRef;
    const { leafletElement: map } = current;

    map.flyTo(data, 14, {
      duration: 2,
    });
  };

  /**
   * Fetch places
   * @description Fetching user input results using debounce
   */
  const fetchResults = React.useMemo(
    () =>
      debounce((request, callback) => {
        getResults(request, callback);
      }, 400),
    []
  );

  /**
   * Fetch Quick Links
   * @description Fetching Quick Links from API (Mock JSON)
   */
  const fetchQuickLinks = async () => {
    try {
      fetch("/quickLinks.json")
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          setQuickList(get(data, "data"));
        });
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    fetchQuickLinks();
  }, []);

  /**
   * Fetch on state change
   * @description Fetching results upon state change
   */
  React.useEffect(() => {
    let active = true;
    fetchResults({ input: inputValue }, (results) => {
      if (active) {
        setOptions(results);
      }
    });
    return () => {
      active = false;
    };
  }, [value, inputValue, fetchResults]);

  /**
   * Marker Reference
   * @description Making Popup always visible using reference
   */
  const initMarker = (ref) => {
    if (ref) {
      ref.leafletElement.openPopup();
    }
  };

  // Consoling value from Store
  console.log("CURRENT SELECTED LOCATION", currentLocation);

  return (
    <div className="App">
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <Map ref={mapRef} center={defaultCenter} zoom={defaultZoom} className="simpleMap" scrollWheelZoom={true} maxZoom={14}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
            {position === null ? null : (
              <Marker position={position} icon={visitorIcon}>
                <Popup>You are here</Popup>
              </Marker>
            )}
            <Marker
              ref={initMarker}
              position={{
                lat: get(value, "y", 1.2858644),
                lng: get(value, "x", 103.85254594021382),
              }}
            >
              <Popup> {get(value, "label", "Maybank, 2, Battery Road, Golden Shoe, Downtown Core, Singapore, Central, 049907, Singapore")}</Popup>
            </Marker>
            <Search position="topleft" inputPlaceholder="Custom placeholder" showMarker={false} zoom={14} closeResultsOnClick={true} openSearchOnLoad={false}>
              {(info) => {
                console.log(info);
                return <Marker position={info?.latLng}>{customPopup(info)}</Marker>;
              }}
            </Search>
          </Map>
        </Grid>
        <Grid item xs={4}>
          <Box sx={{ mt: 5 }}>
            <Autocomplete
              disablePortal
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(event, newValue) => {
                console.log(newValue);
                dispatch(updateLocation(newValue));
                setValue(newValue);
                if (newValue) {
                  handleOnFlyTo([get(newValue, "y"), get(newValue, "x")]);
                }
              }}
              onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
              }}
              options={options}
              sx={{ width: 400 }}
              renderInput={(params) => <TextField {...params} label="Search your favorite location" fullWidth />}
            />
          </Box>
          <Box sx={{ textAlign: "left", mt: 4, height: 500, overflow: "auto" }}>
            <Typography component="h5" variant="h5">
              Quick Links
            </Typography>
            <Divider sx={{ padding: "10px 0" }} />
            <List dense>
              {quickList.map((list, index) => {
                return (
                  <div key={index}>
                    <Tooltip title="Click to locate place" placement="top">
                      <ListItem
                        sx={{ padding: "15px 0" }}
                        onClick={() => {
                          list["x"] = get(list, "lon");
                          list["y"] = get(list, "lat");
                          list["label"] = get(list, "display_name", "");
                          setValue(list);
                          dispatch(updateLocation(list));
                          handleOnFlyTo([get(list, "lat"), get(list, "lon")]);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <ListItemText primary={get(list, "display_name")} secondary={<span>Type: {get(list, "type", "").toUpperCase()}</span>} />
                      </ListItem>
                    </Tooltip>
                    <Divider />
                  </div>
                );
              })}
            </List>
          </Box>
        </Grid>
      </Grid>
    </div>
  );
}

export default Locate;

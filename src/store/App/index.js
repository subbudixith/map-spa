export const initialState = {
  loading: false,
  error: false,
  action: false,
  location: null,
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case "UPDATE_LOCATION":
      return {
        ...state,
        location: action.response,
      };
    default:
      return state;
  }
};

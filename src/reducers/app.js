export const initialState = {
    version: '1.0.1',
};

export default function appReducer(state = initialState, action) {
    switch (action.type) {
        case 'APP_REPLACE': {
            return {
            ...state,
            };
        }
        default:
            return state;
    }
}

const initState = {
    upload: false,
    sample: false,
    file: null,
    index: 0,
    columnsSelected: [],
    columns: [],
    currentMapping: null
}

const mappingReducer = (state = initState, action: any) => {
    switch (action.type) {
        case "INIT_STEPPER":
            return initState

        case "CHANGE_UPLOAD_STEP":
            return {...state, upload: action.payload}

        case "CHANGE_SAMPLE_STEP":
            return {...state, sample: action.payload}

        case "SAVE_FILE":
            return {...state, file: action.payload}

        case "SET_INDEX":
            return {...state, index: action.payload}

        case "SET_SELECTED_COLUMNS":
            return {...state, columnsSelected: action.payload}

        case "SET_COLUMNS":
            return {...state, columns: action.payload}

        case "SET_CURRENT_MAPPING":
            return {...state, currentMapping: action.payload}

        default:
            return state
    }
}

export default mappingReducer;
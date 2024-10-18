
import MasterComponent from './MasterComponent';

const BASE_URL = 'http://localhost:5000/api/parts';

export const SizeMasterComponent = () => (
    <MasterComponent
        title="Size Master"
        endpoint={`${BASE_URL}/sizes`}
        searchEndpoint={`${BASE_URL}/sizes/searchSizeNames`}
        getAllEndpoint={`${BASE_URL}/sizes/allSizeNames`}
        createEndpoint={`${BASE_URL}/sizes/createSizeName`}
        deleteEndpoint={`${BASE_URL}/sizes`}
    />
);

export const ColourMasterComponent = () => (
    <MasterComponent
        title="Colour Master"
        endpoint={`${BASE_URL}/colours`}
        searchEndpoint={`${BASE_URL}/colours/searchColourNames`}
        getAllEndpoint={`${BASE_URL}/colours/allColourNames`}
        createEndpoint={`${BASE_URL}/colours/createColourName`}
        deleteEndpoint={`${BASE_URL}/colours`}
    />
);

export const MakerNameMasterComponent = () => (
    <MasterComponent
        title="Maker Name Master"
        endpoint={`${BASE_URL}/makers`}
        searchEndpoint={`${BASE_URL}/makers/searchMakerNames`}
        getAllEndpoint={`${BASE_URL}/makers/allMakerNames`}
        createEndpoint={`${BASE_URL}/makers/createMakerName`}
        deleteEndpoint={`${BASE_URL}/makers`}
    />
);

export const UnitOfMeasurementMasterComponent = () => (
    <MasterComponent
        title="Unit of Measurement Master"
        endpoint={`${BASE_URL}/units`}
        searchEndpoint={`${BASE_URL}/units/searchMeasurementUnits`}
        getAllEndpoint={`${BASE_URL}/units/allMeasurementUnits`}
        createEndpoint={`${BASE_URL}/units/createMeasurementUnit`}
        deleteEndpoint={`${BASE_URL}/units`}
    />
);

export const ItemCategoriesComponent = () => (
    <MasterComponent
        title="Item Categories"
        endpoint={`${BASE_URL}/itemCategories`}
        searchEndpoint={`${BASE_URL}/itemCategories/search`}
        getAllEndpoint={`${BASE_URL}/itemCategories/all`}
        createEndpoint={`${BASE_URL}/itemCategories/create`}
        deleteEndpoint={`${BASE_URL}/itemCategories`}
    />
);
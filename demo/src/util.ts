import * as functions from 'firebase-functions';

export const FUNCTION_REGION_EU = 'europe-west3';

export const FBFunction = functions.region(FUNCTION_REGION_EU);

export { functions };

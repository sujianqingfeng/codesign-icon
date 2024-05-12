import * as _iconify_types from '@iconify/types';
import { IconifyJSON } from '@iconify/types';

type IconsItem = {
    svg: string;
    name: string;
    class_name: string;
};
type BuildIconifyJSONOptions = {
    prefix: string;
    icons: IconsItem[];
};
type BuildUniAppIconsOptions = {
    rawData: IconifyJSON;
    dist: string;
    exportPrefix?: string;
};
type FetchIconsParams = {
    token: string;
    projectId: string;
    teamId: string;
};

declare function fetchCodesignToken(): Promise<string>;
declare function fetchCodesignIconsByToken(options: FetchIconsParams): Promise<IconsItem[]>;
declare function buildIconifyJSON(options: BuildIconifyJSONOptions): Promise<_iconify_types.IconifyJSON>;
declare function buildUniAppIcons(options: BuildUniAppIconsOptions): Promise<void>;

export { buildIconifyJSON, buildUniAppIcons, fetchCodesignIconsByToken, fetchCodesignToken };

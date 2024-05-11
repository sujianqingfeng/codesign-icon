import { IconifyJSON } from '@iconify/types';

type BuildIconifyJSONOptions = {
    prefix: string;
    projectId: string;
    teamId: string;
    dist?: string;
};
type BuildUniAppIconsOptions = {
    rawData: IconifyJSON;
    dist: string;
    exportPrefix?: string;
};

declare function buildIconifyJSON(options: BuildIconifyJSONOptions): Promise<void>;
declare function buildUniAppIcons(options: BuildUniAppIconsOptions): Promise<void>;

export { buildIconifyJSON, buildUniAppIcons };

import * as _iconify_types from '@iconify/types';
import { IconifyJSON } from '@iconify/types';
import { Compiler } from 'webpack';

type TokenResp = {
    result: null | {
        token: string;
    };
};
type IonsParams = {
    project_id: string;
    team_id: string;
    include: string;
    per_page: number;
    page: number;
};
type BaseListResp<T> = {
    current_page: number;
    next_page_url: null | string;
    to: number;
    data: T[];
};
type IconsItem = {
    svg: string;
    name: string;
    class_name: string;
};
type IconsResp = BaseListResp<IconsItem>;
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

interface Options {
    /**
     * IconifyJSON data
     */
    data: IconifyJSON;
    /**
     * Component name prefix
     * @default 'Icon'
     */
    prefix?: string;
    /**
     * Project root directory
     */
    root?: string;
}
declare class UniappIconPlugin {
    private readonly options;
    private readonly icons;
    private initialized;
    private projectRoot;
    private outputDir;
    constructor(options: Options);
    init(): Promise<void>;
    apply(compiler: Compiler): void;
}

declare function getWeworkLoginToken(): Promise<unknown>;

declare function fetchCodesignIconsByToken(options: FetchIconsParams): Promise<IconsItem[]>;
declare function buildIconifyJSON(options: BuildIconifyJSONOptions): Promise<_iconify_types.IconifyJSON>;
declare function buildUniAppIcons(options: BuildUniAppIconsOptions): Promise<void>;

export { type BaseListResp, type BuildIconifyJSONOptions, type BuildUniAppIconsOptions, type FetchIconsParams, type IconsItem, type IconsResp, type IonsParams, type TokenResp, UniappIconPlugin as WebpackIconPlugin, buildIconifyJSON, buildUniAppIcons, fetchCodesignIconsByToken, getWeworkLoginToken };

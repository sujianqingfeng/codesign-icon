type BuildOptions = {
    prefix: string;
    projectId: string;
    teamId: string;
    dist?: string;
};

declare function build(options: BuildOptions): Promise<void>;

export { build };

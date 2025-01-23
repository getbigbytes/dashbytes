import { DownloadFile, ForbiddenError, NotFoundError } from '@bigbytes/common';
import fs from 'fs';
import { BigbytesConfig } from '../../config/parseConfig';
import { DownloadFileModel } from '../../models/DownloadFileModel';
import { BaseService } from '../BaseService';

type DownloadFileServiceArguments = {
    downloadFileModel: DownloadFileModel;
    bigbytesConfig: Pick<BigbytesConfig, 's3'>;
};

export class DownloadFileService extends BaseService {
    private readonly bigbytesConfig: Pick<BigbytesConfig, 's3'>;

    private readonly downloadFileModel: DownloadFileModel;

    constructor(args: DownloadFileServiceArguments) {
        super();
        this.bigbytesConfig = args.bigbytesConfig;
        this.downloadFileModel = args.downloadFileModel;
    }

    private isS3Enabled = () =>
        this.bigbytesConfig.s3?.endpoint && this.bigbytesConfig.s3.region;

    async getDownloadFile(nanoid: string): Promise<DownloadFile> {
        if (this.isS3Enabled()) {
            throw new ForbiddenError(
                'Downloading files is not available if S3 is enabled',
            );
        }

        const file = await this.downloadFileModel.getDownloadFile(nanoid);

        if (!fs.existsSync(file.path)) {
            const error = `This file ${file.path} doesn't exist on this server, this may be happening if you are running multiple containers or because files are not persisted. You can check out our docs to learn more on how to enable cloud storage: https://docs.bigbytes.com/self-host/customize-deployment/configure-bigbytes-to-use-external-object-storage`;
            throw new NotFoundError(error);
        }
        return file;
    }
}

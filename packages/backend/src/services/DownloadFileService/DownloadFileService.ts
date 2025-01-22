import { DownloadFile, ForbiddenError, NotFoundError } from '@clairdash/common';
import fs from 'fs';
import { ClairdashConfig } from '../../config/parseConfig';
import { DownloadFileModel } from '../../models/DownloadFileModel';
import { BaseService } from '../BaseService';

type DownloadFileServiceArguments = {
    downloadFileModel: DownloadFileModel;
    clairdashConfig: Pick<ClairdashConfig, 's3'>;
};

export class DownloadFileService extends BaseService {
    private readonly clairdashConfig: Pick<ClairdashConfig, 's3'>;

    private readonly downloadFileModel: DownloadFileModel;

    constructor(args: DownloadFileServiceArguments) {
        super();
        this.clairdashConfig = args.clairdashConfig;
        this.downloadFileModel = args.downloadFileModel;
    }

    private isS3Enabled = () =>
        this.clairdashConfig.s3?.endpoint && this.clairdashConfig.s3.region;

    async getDownloadFile(nanoid: string): Promise<DownloadFile> {
        if (this.isS3Enabled()) {
            throw new ForbiddenError(
                'Downloading files is not available if S3 is enabled',
            );
        }

        const file = await this.downloadFileModel.getDownloadFile(nanoid);

        if (!fs.existsSync(file.path)) {
            const error = `This file ${file.path} doesn't exist on this server, this may be happening if you are running multiple containers or because files are not persisted. You can check out our docs to learn more on how to enable cloud storage: https://docs.clairdash.com/self-host/customize-deployment/configure-clairdash-to-use-external-object-storage`;
            throw new NotFoundError(error);
        }
        return file;
    }
}

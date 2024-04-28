import { ListObjectsV2Command, PutObjectAclCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Body, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises } from 'dns';

@Injectable()
export class UploadService {

    private readonly s3client = new S3Client({region: this.configService.getOrThrow('AWS_S3_Region')});

    constructor(private readonly configService:ConfigService){}

    async upload(fileName:string, file:Buffer){

        await this.s3client.send(
            new PutObjectCommand({
                Bucket:'satva-homes-img-upload',
                Key:fileName,
                Body:file

            }),
        );
    }

    async getAllFiles(): Promise<string[]> {
        const params = {
            Bucket: 'satva-homes-img-upload'
        };

        const response = await this.s3client.send(new ListObjectsV2Command(params));
        if (response.Contents) {
            return response.Contents.map(object => object.Key);
        } else {
            return [];
        }
    }

   
}

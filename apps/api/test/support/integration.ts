import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { GenericContainer, type StartedTestContainer, Wait } from 'testcontainers';

const execFileAsync = promisify(execFile);
const apiDirectory = resolve(import.meta.dirname, '../..');
const prismaCli = resolve(apiDirectory, '../../node_modules/.bin/prisma');
const integrationTestTmpDirectory = process.env.INTEGRATION_TEST_TMPDIR ?? '/tmp';

const credentials = {
  accessKeyId: 'test-access-key',
  secretAccessKey: 'test-secret-key',
};

export type SeaweedFsContainer = {
  container: StartedTestContainer;
  endpoint: string;
};

export type IntegrationTestSandbox = {
  bucket: string;
  prisma: PrismaClient;
  s3: S3Client;
  cleanup: () => Promise<void>;
};

export async function startSeaweedFs(): Promise<SeaweedFsContainer> {
  const container = await new GenericContainer('chrislusf/seaweedfs:4.29')
    .withEnvironment({
      AWS_ACCESS_KEY_ID: credentials.accessKeyId,
      AWS_SECRET_ACCESS_KEY: credentials.secretAccessKey,
    })
    .withExposedPorts(8333)
    .withWaitStrategy(Wait.forListeningPorts())
    .start();

  return {
    container,
    endpoint: `http://${container.getHost()}:${container.getMappedPort(8333)}`,
  };
}

export async function createIntegrationTestSandbox(
  seaweedFs: SeaweedFsContainer,
): Promise<IntegrationTestSandbox> {
  const directory = await mkdtemp(join(integrationTestTmpDirectory, 'dashboard-api-test-'));
  const databasePath = join(directory, 'test.db');
  const databaseUrl = `file:${databasePath}`;
  const bucket = `test-${crypto.randomUUID()}`;
  const prismaEnvironment = { ...process.env, DATABASE_URL: databaseUrl };
  const s3 = new S3Client({
    credentials,
    endpoint: seaweedFs.endpoint,
    forcePathStyle: true,
    region: 'us-east-1',
  });

  delete prismaEnvironment.RUST_LOG;

  try {
    await execFileAsync(prismaCli, ['db', 'push', '--skip-generate'], {
      cwd: apiDirectory,
      env: prismaEnvironment,
    });
  } catch (error) {
    await rm(directory, { force: true, recursive: true });
    throw error;
  }

  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  await s3.send(new CreateBucketCommand({ Bucket: bucket }));

  return {
    bucket,
    prisma,
    s3,
    cleanup: async () => {
      try {
        await emptyBucket(s3, bucket);
        await s3.send(new DeleteBucketCommand({ Bucket: bucket }));
      } finally {
        await prisma.$disconnect();
        await s3.destroy();
        await rm(directory, { force: true, recursive: true });
      }
    },
  };
}

async function emptyBucket(s3: S3Client, bucket: string): Promise<void> {
  let continuationToken: string | undefined;

  do {
    const result = await s3.send(
      new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: continuationToken }),
    );
    const objects = result.Contents?.flatMap(({ Key }) => (Key ? [{ Key }] : [])) ?? [];

    if (objects.length > 0) {
      await s3.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: objects } }));
    }

    continuationToken = result.IsTruncated ? result.NextContinuationToken : undefined;
  } while (continuationToken);
}

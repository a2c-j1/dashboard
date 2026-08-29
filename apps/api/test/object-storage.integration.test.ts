import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  createIntegrationTestSandbox,
  startSeaweedFs,
  type IntegrationTestSandbox,
  type SeaweedFsContainer,
} from './support/integration.js';

const describeIntegration = process.env.RUN_INTEGRATION_TESTS === '1' ? describe : describe.skip;
const containerStartupTimeout = 60_000;

describeIntegration('object storage integration', () => {
  let seaweedFs: SeaweedFsContainer | undefined;
  let sandbox: IntegrationTestSandbox | undefined;

  beforeAll(async () => {
    seaweedFs = await startSeaweedFs();
  }, containerStartupTimeout);

  beforeEach(async () => {
    if (!seaweedFs) {
      throw new Error('SeaweedFS container did not start');
    }

    sandbox = await createIntegrationTestSandbox(seaweedFs);
  });

  afterEach(async () => {
    await sandbox?.cleanup();
  });

  afterAll(async () => {
    await seaweedFs?.container.stop();
  });

  it('isolates an S3 object and SQLite record for this test', async () => {
    if (!sandbox) {
      throw new Error('Integration test sandbox was not created');
    }

    await sandbox.s3.send(
      new PutObjectCommand({
        Body: 'test payload',
        Bucket: sandbox.bucket,
        ContentType: 'text/plain',
        Key: 'uploads/example.txt',
      }),
    );
    await sandbox.prisma.setting.create({
      data: { key: 'uploaded-object', value: 'uploads/example.txt' },
    });

    const object = await sandbox.s3.send(
      new GetObjectCommand({ Bucket: sandbox.bucket, Key: 'uploads/example.txt' }),
    );

    expect(await object.Body?.transformToString()).toBe('test payload');
    await expect(
      sandbox.prisma.setting.findUnique({ where: { key: 'uploaded-object' } }),
    ).resolves.toMatchObject({
      value: 'uploads/example.txt',
    });
  });
});

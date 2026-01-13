import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateWebhooksTable1736759700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'webhooks',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'tenantId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'url',
            type: 'text',
          },
          {
            name: 'events',
            type: 'text',
            comment: 'Comma-separated list of webhook events',
          },
          {
            name: 'headers',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'secret',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Secret for HMAC signature verification',
          },
          {
            name: 'isActive',
            type: 'tinyint',
            default: 1,
          },
          {
            name: 'failureCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'lastTriggeredAt',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'lastFailedAt',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign key for tenantId
    await queryRunner.createForeignKey(
      'webhooks',
      new TableForeignKey({
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    // Create index on tenantId for faster queries
    await queryRunner.query(
      `CREATE INDEX IDX_webhooks_tenantId ON webhooks (tenantId)`,
    );

    // Create index on isActive for faster queries
    await queryRunner.query(
      `CREATE INDEX IDX_webhooks_isActive ON webhooks (isActive)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('webhooks');
  }
}

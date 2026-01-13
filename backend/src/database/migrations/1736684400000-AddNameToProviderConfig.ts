import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNameToProviderConfig1736684400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'provider_configs',
      new TableColumn({
        name: 'name',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('provider_configs', 'name');
  }
}

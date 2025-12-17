import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateInsurancePoliciesTable1702000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'insurance_policies',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['life', 'health', 'education', 'disability'],
            default: "'education'",
          },
          {
            name: 'policy_number',
            type: 'varchar',
            length: '50',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'active', 'expired', 'cancelled', 'rejected'],
            default: "'pending'",
          },
          {
            name: 'premium',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'coverage_amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'start_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'end_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'beneficiaries',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'medical_info',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'underwriter_data',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'insurance_policies',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX idx_insurance_policies_user_id ON insurance_policies(user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_insurance_policies_status ON insurance_policies(status)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_insurance_policies_type ON insurance_policies(type)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('insurance_policies');
  }
}

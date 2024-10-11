import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'swap_transaction' })
export class SwapTransaction {
  @PrimaryGeneratedColumn() id!: number;

  @Column()
  ethAmount!: GLfloat;

  @Column()
  btcAmount?: GLfloat;

  @Column()
  ethFee?: GLfloat;

  @Column()
  usdFee?: GLfloat;

  @Column()
  @CreateDateColumn()
  created_at!: Date;

  @Column()
  @UpdateDateColumn()
  updated_at!: Date;
}

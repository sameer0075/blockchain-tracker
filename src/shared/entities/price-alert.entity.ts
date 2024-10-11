import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'price_alert' })
export class PriceAlert {
  @PrimaryGeneratedColumn() id!: number;

  @Column()
  chain!: string;

  @Column()
  threshold!: GLfloat;

  @Column()
  email!: string;

  @Column()
  @CreateDateColumn()
  created_at!: Date;

  @Column()
  @UpdateDateColumn()
  updated_at!: Date;
}

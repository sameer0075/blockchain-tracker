import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'price' })
export class Price {
  @PrimaryGeneratedColumn() id!: number;

  @Column()
  chain!: string;

  @Column()
  price?: GLfloat;

  @Column()
  @CreateDateColumn()
  created_at!: Date;

  @Column()
  @UpdateDateColumn()
  updated_at!: Date;
}

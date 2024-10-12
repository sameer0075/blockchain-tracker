import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Chain } from './chain.entity';

@Entity()
export class Price {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chain, (chain) => chain.prices)
  @JoinColumn({ name: 'chainId' }) // This sets 'chain_id' as the foreign key
  chain: Chain;

  @Column('numeric', { precision: 15, scale: 6 })
  price: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}

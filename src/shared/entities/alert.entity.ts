import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Chain } from './chain.entity';

@Entity()
export class Alert {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Chain, (chain) => chain.alerts)
    @JoinColumn({ name: 'chain_id' }) // Define the foreign key column name
    chain: Chain;

    @Column('numeric', { precision: 15, scale: 6 })
    target_price: number;

    @Column({ length: 255 })
    email: string;

    @Column({ default: false })
    is_triggered: boolean;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;
}

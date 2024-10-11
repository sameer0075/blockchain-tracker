import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Price } from './price.entity';
import { Alert } from './alert.entity';

@Entity()
export class Chain {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50 })
    name: string;

    @Column({ length: 10 })
    symbol: string;

    @OneToMany(() => Price, (price) => price.chain, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    prices: Price[];

    @OneToMany(() => Alert, (alert) => alert.chain, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    alerts: Alert[];
}

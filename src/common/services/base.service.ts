import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';

export class BaseService<T> {
  private repo;
  private entityName: string;
  constructor(repo: Repository<T>, entityName: string) {
    this.repo = repo;
    this.entityName = entityName;
  }

  async findAll(opts?): Promise<T[]> {
    const data = await this.repo.find(opts);
    return data;
  }

  async findOne(opts?): Promise<T> {
    return this.repo.findOne(opts);
  }

  async save(payload, relations?): Promise<T> {
    const data = await this.repo.save(payload, relations);
    return data;
  }

  async update(id: number, payload, relations?): Promise<T> {
    await this.repo.update(id, payload);
    payload['id'] = id;
    const savedData = relations
      ? await this.findOne({
          where: { id },
          relations: relations.relations,
        })
      : payload;

    return savedData;
  }

  async delete(id): Promise<T> {
    return this.repo.delete(id);
  }

  async softDelete(id): Promise<T> {
    return this.repo.softDelete(id);
  }

  async Count(): Promise<T> {
    return this.repo.count();
  }
}

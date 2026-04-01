import { BaseRepository } from '../../../common/database';
import { Category } from '../models';
export declare class CategoryRepository extends BaseRepository {
    findAllActive(): Promise<Category[]>;
    findByIds(ids: string[]): Promise<Category[]>;
}

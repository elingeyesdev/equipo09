import { CategoryRepository } from '../repositories';
import { Category } from '../models';
export declare class CategoryService {
    private readonly categoryRepo;
    constructor(categoryRepo: CategoryRepository);
    findAll(): Promise<Category[]>;
}

import { CategoryService } from '../services';
import { ApiSuccessResponse } from '../../../common/dto';
import { Category } from '../models';
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    findAll(): Promise<ApiSuccessResponse<Category[]>>;
}

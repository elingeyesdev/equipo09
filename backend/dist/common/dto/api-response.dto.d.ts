export declare class PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
    constructor(data: T[], total: number, page: number, limit: number);
}
export declare class PaginationMeta {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
export declare class ApiSuccessResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    constructor(data?: T, message?: string);
}

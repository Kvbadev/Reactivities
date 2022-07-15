export interface Pagination {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
}

export class PaginatedResult<T> {
    data: T;
    pagination: Pagination;

    constructor(data: T, pagination: Pagination){
        this.data = data;
        this.pagination = pagination;
    }
}

export class PagingParams {
    pageNumber;
    pageSize;
    constructor(pN = 1, pS = 2){
        this.pageNumber = pN;
        this.pageSize = pS;
    }
}
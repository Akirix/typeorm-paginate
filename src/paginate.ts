import { Repository, FindConditions, FindManyOptions } from "typeorm";
import { Page } from "./Page";
import { Pageable } from "./interfaces";

export async function paginate<T>(
  repository: Repository<T>,
  options: Pageable,
  searchOptions?: FindConditions<T> | FindManyOptions<T>
): Promise<Page<T>> {
  const page =
    options.page > 0 ? options.page - 1 : options.page < 0 ? 0 : options.page;
  const limit = options.limit;
  const route = options.route;

  delete options.page;
  delete options.limit;
  delete options.route;

  const [items, total] = await repository.findAndCount({
    skip: page * limit,
    take: limit,
    ...searchOptions,
  });

  const isNext = route && total / limit >= page + 1;
  const isPrevious = route && page > 0;
  const routes = {
    next: isNext ? `${route}?page=${page + 2}&limit=${limit}` : "",
    previous: isPrevious ? `${route}?page=${page}&limit=${limit}` : ""
  };

  return new Page(
    items,
    items.length,
    total,
    Math.ceil(total / limit),
    routes.next,
    routes.previous
  );
}

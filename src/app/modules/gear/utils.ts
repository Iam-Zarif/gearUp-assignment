import { GearStatus, Prisma } from "../../../generated/prisma/client";
import { gearSearchableFields, gearSortableFields } from "./constant";
import { TGearQuery } from "./interface";

const getQueryString = (value: unknown): string | undefined => {
  return typeof value === "string" ? value : undefined;
};

const buildGearWhereConditions = (
  query: TGearQuery
): Prisma.GearItemWhereInput => {
  const searchTerm = getQueryString(query.searchTerm);
  const categoryId = getQueryString(query.categoryId);
  const category = getQueryString(query.category);
  const brand = getQueryString(query.brand);
  const minPrice = getQueryString(query.minPrice);
  const maxPrice = getQueryString(query.maxPrice);
  const availability = getQueryString(query.availability);
  const status = getQueryString(query.status);

  const andConditions: Prisma.GearItemWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: gearSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })) as Prisma.GearItemWhereInput[],
    });
  }

  if (categoryId) {
    andConditions.push({ categoryId });
  }

  if (category) {
    andConditions.push({
      category: {
        name: {
          contains: category,
          mode: "insensitive",
        },
      },
    });
  }

  if (brand) {
    andConditions.push({
      brand: {
        contains: brand,
        mode: "insensitive",
      },
    });
  }

  if (minPrice || maxPrice) {
    andConditions.push({
      pricePerDay: {
        gte: minPrice ? Number(minPrice) : undefined,
        lte: maxPrice ? Number(maxPrice) : undefined,
      },
    });
  }

  if (availability === "available") {
    andConditions.push({
      status: GearStatus.AVAILABLE,
      availableQuantity: {
        gt: 0,
      },
    });
  }

  if (availability === "unavailable") {
    andConditions.push({
      OR: [
        {
          status: GearStatus.UNAVAILABLE,
        },
        {
          availableQuantity: {
            lte: 0,
          },
        },
      ],
    });
  }

  if (status && Object.values(GearStatus).includes(status as GearStatus)) {
    andConditions.push({
      status: status as GearStatus,
    });
  }

  return andConditions.length > 0 ? { AND: andConditions } : {};
};

const buildGearOrderBy = (
  query: TGearQuery
): Prisma.GearItemOrderByWithRelationInput => {
  const sortByQuery = getQueryString(query.sortBy);
  const sortOrderQuery = getQueryString(query.sortOrder);

  const sortBy =
    sortByQuery && gearSortableFields.includes(sortByQuery)
      ? sortByQuery
      : "createdAt";

  const sortOrder = sortOrderQuery === "asc" ? "asc" : "desc";

  return {
    [sortBy]: sortOrder,
  } as Prisma.GearItemOrderByWithRelationInput;
};

const getPaginationOptions = (query: TGearQuery) => {
  const pageQuery = getQueryString(query.page);
  const limitQuery = getQueryString(query.limit);

  const page = Number(pageQuery) || 1;
  const limit = Number(limitQuery) || 10;
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

export const GearUtils = {
  buildGearWhereConditions,
  buildGearOrderBy,
  getPaginationOptions,
};
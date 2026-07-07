import AppError from "../../errors/AppError";
import { prisma } from "../../helpers/prisma";

type TCategoryPayload = {
  name: string;
  description?: string;
};

const createCategory = async (payload: TCategoryPayload) => {
  const existingCategory = await prisma.category.findUnique({
    where: {
      name: payload.name,
    },
  });

  if (existingCategory) {
    throw new AppError(409, "Category already exists");
  }

  const result = await prisma.category.create({
    data: payload,
  });

  return result;
};

const getAllCategories = async () => {
  const result = await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const updateCategory = async (id: string, payload: Partial<TCategoryPayload>) => {
  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  if (payload.name) {
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name: payload.name,
        NOT: {
          id,
        },
      },
    });

    if (duplicateCategory) {
      throw new AppError(409, "Category already exists");
    }
  }

  const result = await prisma.category.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  const gearCount = await prisma.gearItem.count({
    where: {
      categoryId: id,
    },
  });

  if (gearCount > 0) {
    throw new AppError(400, "Cannot delete category with existing gear items");
  }

  const result = await prisma.category.delete({
    where: {
      id,
    },
  });

  return result;
};

export const CategoryServices = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
}

import Link from 'next/link';

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export const CategoryCard = ({ category, className = '' }: CategoryCardProps) => {
  return (
    <Link href={`/categories/${category._id}`} className={`block ${className}`}>
      <div className="relative h-48 rounded-lg overflow-hidden">
        {category.image && (
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{category.name}</h3>
        <p className="text-gray-600">{category.description}</p>
      </div>
    </Link>
  );
};

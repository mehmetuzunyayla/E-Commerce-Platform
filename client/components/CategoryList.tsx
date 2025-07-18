'use client';
import { Category } from '../types/product';
import { Card, Image, Text } from '@mantine/core';
import Link from 'next/link';

interface Props {
  categories: Category[];
}

export default function CategoryList({ categories }: Props) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-10">
      {categories.map((cat) => (
        <Link key={cat._id} href={`/category/${cat._id}`}>
          <Card shadow="md" radius="md" p="lg" withBorder className="hover:shadow-lg transition">
            <Card.Section>
              <Image
                src={cat.image || '/category-placeholder.png'}
                height={120}
                alt={cat.name}
              />
            </Card.Section>
            <Text fw={700} size="lg" mt="md">{cat.name}</Text>
            <Text c="dimmed" size="sm" mb="sm" lineClamp={2}>{cat.description}</Text>
          </Card>
        </Link>
      ))}
    </div>
  );
}

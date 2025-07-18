'use client';
import { useEffect, useState } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useSelector } from 'react-redux';
import { RootState } from '../features/store';
import { fetchReviews, deleteReview, updateReview } from '../features/review/reviewSlice';
import { Button, Textarea, NumberInput } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export default function ReviewsList({ productId }: { productId: string }) {
  const dispatch = useAppDispatch();
  const { reviews, loading } = useSelector((state: RootState) => state.review);
  const { user } = useSelector((state: RootState) => state.auth);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({ rating: 1, comment: '' });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
  });

  useEffect(() => {
    dispatch(fetchReviews(productId) as any);
  }, [dispatch, productId]);

  const handleEdit = (review: any) => {
    setEditingReview(review);
    setEditFormData({ rating: review.rating, comment: review.comment || '' });
    setValue('rating', review.rating);
    setValue('comment', review.comment || '');
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditFormData({ rating: 1, comment: '' });
    reset();
  };

  const handleUpdateReview = async (data: ReviewFormData) => {
    if (editingReview) {
      const result = await dispatch(updateReview({ reviewId: editingReview._id, review: data }) as any);
      
      if (updateReview.fulfilled.match(result)) {
        setEditingReview(null);
        setEditFormData({ rating: 1, comment: '' });
        reset();
        // Refresh reviews to get updated data
        dispatch(fetchReviews(productId) as any);
      }
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      const result = await dispatch(deleteReview(reviewId) as any);
      
      if (deleteReview.fulfilled.match(result)) {
        // Refresh reviews to get updated data
        dispatch(fetchReviews(productId) as any);
      }
    }
  };

  if (loading) return <div>Loading reviews...</div>;
  if (!reviews.length) return <div>No reviews yet.</div>;

  return (
    <div>
      <ul className="space-y-4">
        {reviews.map(review => (
          <li key={review._id} className="border-b pb-4">
            {editingReview?._id === review._id ? (
              // Edit Mode
              <form onSubmit={handleSubmit(handleUpdateReview)} className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-3">
                    <NumberInput
                      label="Rating"
                      min={1}
                      max={5}
                      value={editFormData.rating}
                      onChange={(val) => {
                        const numVal = typeof val === 'number' ? val : 1;
                        setEditFormData(prev => ({ ...prev, rating: numVal }));
                        setValue('rating', numVal);
                      }}
                      error={errors.rating?.message}
                    />
                    <Textarea
                      label="Comment"
                      value={editFormData.comment}
                      onChange={(e) => {
                        setEditFormData(prev => ({ ...prev, comment: e.target.value }));
                        setValue('comment', e.target.value);
                      }}
                      error={errors.comment?.message}
                    />
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button size="xs" type="submit" color="green">
                      Save
                    </Button>
                    <Button size="xs" variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              // View Mode
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-semibold">Rating: {review.rating}/5</div>
                  <div className="mt-1">{review.comment}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    By {typeof review.user === 'object' ? review.user.email : review.user} on {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {user && (review.user === user._id || (typeof review.user === 'object' && review.user._id === user._id) || user.role === 'admin') && (
                  <div className="flex gap-2 ml-4">
                    <Button size="xs" color="blue" onClick={() => handleEdit(review)}>
                      Edit
                    </Button>
                    <Button size="xs" color="red" onClick={() => handleDeleteReview(review._id)}>
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

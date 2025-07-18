'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema, ReviewFormData } from '../lib/zodSchemas';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useSelector } from 'react-redux';
import { RootState } from '../features/store';
import { addReview, checkCanReview } from '../features/review/reviewSlice';
import { Button, Textarea, NumberInput, Alert } from '@mantine/core';
import { useState, useEffect } from 'react';

export default function ReviewForm({ productId }: { productId: string }) {
  const dispatch = useAppDispatch();
  const [success, setSuccess] = useState(false);
  const { canReview, loading } = useSelector((state: RootState) => state.review);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
  });

  // Check if user can review this product
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(checkCanReview(productId) as any);
    }
  }, [dispatch, productId, isAuthenticated]);

  const onSubmit = async (data: ReviewFormData) => {
    await dispatch(addReview({ productId, review: data }));
    setSuccess(true);
    reset();
    // Re-check if user can still review (they can't after submitting)
    dispatch(checkCanReview(productId) as any);
  };

  // Don't show form if user is not authenticated
  if (!isAuthenticated) {
    return (
      <Alert color="blue" title="Login Required">
        Please log in to add a review.
      </Alert>
    );
  }

  // Don't show form if user cannot review
  if (canReview === false) {
    return (
      <Alert color="blue" title="Review Requirements">
        You can only review products that have been delivered to you. If you have already reviewed this product, you cannot review it again.
      </Alert>
    );
  }

  // Show loading while checking
  if (loading || canReview === null) {
    return <div>Checking if you can review this product...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <NumberInput
        label="Rating"
        min={1}
        max={5}
        {...register('rating', { valueAsNumber: true })}
        onChange={(val) => {
          if (typeof val === 'number') {
            setValue('rating', val);
          }
        }}
        error={errors.rating?.message}
      />
      <Textarea
        label="Comment"
        {...register('comment')}
        error={errors.comment?.message}
      />
      <Button type="submit" loading={isSubmitting}>Submit Review</Button>
      {success && <div className="text-green-600">Thank you for your review!</div>}
    </form>
  );
}

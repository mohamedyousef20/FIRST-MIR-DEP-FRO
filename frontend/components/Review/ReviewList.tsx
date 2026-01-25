import React from 'react';
import { Rating } from '@/lib/api/services/rating/rating.service';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import RatingStars from '../Rating/RatingStars';

type ReviewListProps = {
  reviews: Rating[];
  onHelpfulClick?: (reviewId: string, helpful: boolean) => void;
  currentUserId?: string;
  className?: string;
};

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  onHelpfulClick,
  currentUserId,
  className,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const renderVerificationBadge = (isVerified: boolean) => {
    if (isVerified) {
      return (
        <Badge variant="outline" className="ml-2 text-green-600 border-green-300 bg-green-50">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified Purchase
        </Badge>
      );
    }
    return null;
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="outline" className="ml-2 text-green-600 border-green-300 bg-green-50">
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="ml-2 text-red-600 border-red-300 bg-red-50">
            Rejected
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="ml-2 text-amber-600 border-amber-300 bg-amber-50">
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No reviews yet. Be the first to review!
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.user?.photo} alt={review.user?.name} />
                    <AvatarFallback>
                      {review.user?.name ? getInitials(review.user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium">{review.user?.name || 'Anonymous'}</h4>
                      {renderVerificationBadge(review.isVerifiedPurchase)}
                      {review.status !== 'approved' && renderStatusBadge(review.status)}
                    </div>
                    <div className="flex items-center mt-1">
                      <RatingStars
                        rating={review.rating}
                        size={16}
                        className="mr-2"
                        readOnly
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {review.review && (
                <p className="mt-3 text-gray-700 dark:text-gray-300">{review.review}</p>
              )}

              {review.images && review.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {review.images.map((image: string, idx: number) => (
                    <div key={idx} className="relative group">
                      <img
                        src={image}
                        alt={`Review ${idx + 1}`}
                        className="w-16 h-16 object-cover rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          // You can implement a lightbox here
                          //console.log('Open image:', image);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {onHelpfulClick && (
                <div className="flex items-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="mr-4">Was this review helpful?</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-sm"
                    onClick={() => onHelpfulClick(review.id, true)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                    <span>Yes</span>
                    {review.helpfulCount > 0 && (
                      <span className="ml-1">({review.helpfulCount})</span>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-sm"
                    onClick={() => onHelpfulClick(review.id, false)}
                  >
                    <XCircle className="w-4 h-4 mr-1 text-red-500" />
                    <span>No</span>
                    {review.notHelpfulCount > 0 && (
                      <span className="ml-1">({review.notHelpfulCount})</span>
                    )}
                  </Button>
                </div>
              )}

              {review.status === 'rejected' && review.adminComment && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <HelpCircle className="w-4 h-4 mr-1 text-amber-500" />
                    Admin Note
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {review.adminComment}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList;

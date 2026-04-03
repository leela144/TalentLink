// src/components/reviews/ReviewModal.jsx
import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { reviewAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { FiX, FiStar } from 'react-icons/fi'

const ReviewModal = ({ freelancerId, projectId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)

  const validationSchema = Yup.object({
    rating: Yup.number()
      .min(1, 'Rating is required')
      .max(5, 'Rating cannot exceed 5')
      .required('Rating is required'),
    comment: Yup.string()
      .min(10, 'Comment should be at least 10 characters')
      .max(500, 'Comment should not exceed 500 characters')
      .required('Comment is required'),
  })

  const formik = useFormik({
    initialValues: {
      rating: 0,
      comment: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true)
      try {
        await reviewAPI.create({
          freelancerId,
          projectId,
          ...values
        })
        toast.success('Review submitted successfully')
        onSuccess()
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to submit review')
      } finally {
        setLoading(false)
      }
    },
  })

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => formik.setFieldValue('rating', star)}
        onMouseEnter={() => setHoverRating(star)}
        onMouseLeave={() => setHoverRating(0)}
        className="p-1"
      >
        <FiStar
          className={`w-8 h-8 ${
            star <= (hoverRating || formik.values.rating)
              ? 'text-yellow-500 fill-current'
              : 'text-gray-300'
          }`}
        />
      </button>
    ))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Leave a Review</h3>
              <p className="text-gray-500 text-sm mt-1">
                Share your experience working with this freelancer
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={formik.handleSubmit}>
            <div className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rating *
                </label>
                <div className="flex justify-center mb-2">
                  {renderStars()}
                </div>
                {formik.touched.rating && formik.errors.rating && (
                  <p className="mt-1 text-sm text-red-600 text-center">{formik.errors.rating}</p>
                )}
                <p className="text-center text-sm text-gray-500 mt-2">
                  {formik.values.rating === 0
                    ? 'Select a rating'
                    : `${formik.values.rating} star${formik.values.rating > 1 ? 's' : ''}`}
                </p>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Review *
                </label>
                <textarea
                  name="comment"
                  rows={4}
                  value={formik.values.comment}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 border rounded-md ${
                    formik.touched.comment && formik.errors.comment
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="Describe your experience working with this freelancer. What did they do well? What could be improved?"
                />
                {formik.touched.comment && formik.errors.comment && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.comment}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 text-right">
                  {formik.values.comment.length}/500 characters
                </p>
              </div>

              {/* Guidelines */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Review Guidelines:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Be honest and constructive in your feedback</li>
                  <li>• Focus on the work quality and communication</li>
                  <li>• Mention specific positive aspects and areas for improvement</li>
                  <li>• Avoid personal attacks or inappropriate language</li>
                  <li>• Your review will be publicly visible</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ReviewModal
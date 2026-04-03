import Review from "../models/Review.js";

// Create a review (client only)
export const createReview = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({ message: "Only clients can create reviews" });
    }

    const { freelancerId, projectId, rating, comment } = req.body;

    if (!freelancerId || !projectId || !rating) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const review = await Review.create({
      reviewerId: req.user._id,
      revieweeId: freelancerId,
      projectId,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: "Error creating review", error: error.message });
  }
};

// Get all reviews (visible to all logged-in users)
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("reviewerId", "name email")
      .populate("revieweeId", "name email skills hourlyRate") // show freelancer info
      .populate("projectId", "title");

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error: error.message });
  }
};

// Get a single review by ID
export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("reviewerId", "name email")
      .populate("revieweeId", "name email skills hourlyRate")
      .populate("projectId", "title");

    if (!review) return res.status(404).json({ message: "Review not found" });

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: "Error fetching review", error: error.message });
  }
};

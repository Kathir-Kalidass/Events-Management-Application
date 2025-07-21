import asyncHandler from "express-async-handler";
import FeedbackQuestion from "../../../shared/models/feedbackQuestionModel.js";

// Get all active feedback questions
export const getFeedbackQuestions = asyncHandler(async (req, res) => {
  try {
    const questions = await FeedbackQuestion.find({ isActive: true })
      .sort({ order: 1 })
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      questions,
      totalCount: questions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all feedback questions (including inactive) - Admin only
export const getAllFeedbackQuestions = asyncHandler(async (req, res) => {
  try {
    const questions = await FeedbackQuestion.find()
      .sort({ order: 1 })
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      questions,
      totalCount: questions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create new feedback question
export const createFeedbackQuestion = asyncHandler(async (req, res) => {
  try {
    const {
      questionId,
      questionText,
      questionType,
      options,
      isRequired,
      isActive,
      order,
      category,
      multiline,
      rows,
      minRating,
      maxRating,
      placeholder,
      helpText
    } = req.body;

    // Check if questionId already exists
    const existingQuestion = await FeedbackQuestion.findOne({ questionId });
    if (existingQuestion) {
      return res.status(400).json({
        success: false,
        message: "Question ID already exists"
      });
    }

    const question = new FeedbackQuestion({
      questionId,
      questionText,
      questionType,
      options: options || [],
      isRequired: isRequired !== undefined ? isRequired : true,
      isActive: isActive !== undefined ? isActive : true,
      order,
      category: category || 'overall',
      multiline: multiline || false,
      rows: rows || 1,
      minRating: minRating || 1,
      maxRating: maxRating || 5,
      placeholder: placeholder || '',
      helpText: helpText || '',
      createdBy: req.user._id
    });

    await question.save();
    await question.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: "Feedback question created successfully",
      question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update feedback question
export const updateFeedbackQuestion = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const question = await FeedbackQuestion.findById(id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Feedback question not found"
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        question[key] = updateData[key];
      }
    });

    await question.save();
    await question.populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: "Feedback question updated successfully",
      question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete feedback question
export const deleteFeedbackQuestion = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const question = await FeedbackQuestion.findById(id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Feedback question not found"
      });
    }

    await FeedbackQuestion.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Feedback question deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Reorder feedback questions
export const reorderFeedbackQuestions = asyncHandler(async (req, res) => {
  try {
    const { questionOrders } = req.body; // Array of { id, order }

    if (!Array.isArray(questionOrders)) {
      return res.status(400).json({
        success: false,
        message: "questionOrders must be an array"
      });
    }

    // Update order for each question
    const updatePromises = questionOrders.map(({ id, order }) =>
      FeedbackQuestion.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "Question order updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Initialize default feedback questions
export const initializeDefaultQuestions = asyncHandler(async (req, res) => {
  try {
    // Check if questions already exist
    const existingCount = await FeedbackQuestion.countDocuments();
    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Feedback questions already exist"
      });
    }

    const defaultQuestions = [
      {
        questionId: 'q1_organization',
        questionText: 'How effectively do you think the organization of this training programme facilitated a conducive learning environment and promoted active participation among participants?',
        questionType: 'rating',
        isRequired: true,
        order: 1,
        category: 'organization',
        helpText: 'Rate from 1 (Poor) to 5 (Excellent)'
      },
      {
        questionId: 'q2_communication',
        questionText: 'How effectively did the resource persons communicate and engage with the participants to enhance their learning experience?',
        questionType: 'rating',
        isRequired: true,
        order: 2,
        category: 'presentation',
        helpText: 'Rate from 1 (Poor) to 5 (Excellent)'
      },
      {
        questionId: 'q3_content_relevance',
        questionText: 'How well do you think the topics covered align with the current trends and challenges, and to what extent did they contribute to your professional development?',
        questionType: 'rating',
        isRequired: true,
        order: 3,
        category: 'content',
        helpText: 'Rate from 1 (Poor) to 5 (Excellent)'
      },
      {
        questionId: 'q4_presentation_style',
        questionText: 'How effective was the presentation style in conveying the key concepts and fostering a dynamic learning environment for the participants?',
        questionType: 'rating',
        isRequired: true,
        order: 4,
        category: 'presentation',
        helpText: 'Rate from 1 (Poor) to 5 (Excellent)'
      },
      {
        questionId: 'q5_overall_effectiveness',
        questionText: 'Please provide an overall assessment of the program\'s overall effectiveness',
        questionType: 'rating',
        isRequired: true,
        order: 5,
        category: 'overall',
        helpText: 'Rate from 1 (Poor) to 5 (Excellent)'
      },
      {
        questionId: 'q6_improvement_suggestions',
        questionText: 'How do you think the training programme could have been more effective? (In 2 lines)',
        questionType: 'text',
        multiline: true,
        rows: 2,
        isRequired: true,
        order: 6,
        category: 'suggestions',
        placeholder: 'Please provide your suggestions for improvement...'
      },
      {
        questionId: 'q7_overall_satisfaction',
        questionText: 'How satisfied were you overall?',
        questionType: 'rating',
        isRequired: true,
        order: 7,
        category: 'overall',
        helpText: 'Rate from 1 (Very Dissatisfied) to 5 (Very Satisfied)'
      },
      {
        questionId: 'q8_recommendation',
        questionText: 'Would you recommend the workshop to your colleagues or peers?',
        questionType: 'radio',
        options: ['Yes', 'No'],
        isRequired: true,
        order: 8,
        category: 'overall'
      },
      {
        questionId: 'q9_interesting_topics',
        questionText: 'Which topics or aspects of the sessions did you find most interesting or useful?',
        questionType: 'text',
        multiline: true,
        rows: 3,
        isRequired: true,
        order: 9,
        category: 'content',
        placeholder: 'Please describe the topics you found most valuable...'
      },
      {
        questionId: 'q10_additional_comments',
        questionText: 'Any additional comments or suggestions?',
        questionType: 'text',
        multiline: true,
        rows: 3,
        isRequired: false,
        order: 10,
        category: 'suggestions',
        placeholder: 'Optional: Share any additional thoughts...'
      }
    ];

    const createdQuestions = await FeedbackQuestion.insertMany(
      defaultQuestions.map(q => ({ ...q, createdBy: req.user._id }))
    );

    res.status(201).json({
      success: true,
      message: "Default feedback questions initialized successfully",
      questions: createdQuestions,
      count: createdQuestions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default {
  getFeedbackQuestions,
  getAllFeedbackQuestions,
  createFeedbackQuestion,
  updateFeedbackQuestion,
  deleteFeedbackQuestion,
  reorderFeedbackQuestions,
  initializeDefaultQuestions
};
import Event from '../../models/eventModel.js';
import User from '../../models/userModel.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import { syncAmountFields, syncClaimBill } from '../../utils/amountSyncHelper.js';

// Submit a new claim
export const submitClaim = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const { expenses, description, attachments } = req.body;
    const submittedBy = req.user._id;

    // Validate event exists and user has permission
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is coordinator of this event
    const isCoordinator = event.createdBy.toString() === submittedBy.toString() ||
                         event.coordinators.some(coord => coord.userId && coord.userId.toString() === submittedBy.toString());
    
    if (!isCoordinator) {
      return res.status(403).json({ message: 'Not authorized to submit claim for this event' });
    }

    // Check if claim already exists for this event
    if (event.claimBill && event.claimBill.expenses && event.claimBill.expenses.length > 0) {
      return res.status(400).json({ message: 'Claim already submitted for this event' });
    }

    // Process expenses and calculate totals
    const processedExpenses = expenses.map(expense => {
      const amount = expense.actualAmount || expense.budgetAmount || 0;
      return {
        category: expense.category,
        budgetAmount: amount,
        actualAmount: amount,
        amount: amount, // ✅ CRITICAL: All amount fields must be identical
        approvedAmount: 0, // Initially 0, will be set during approval
        description: expense.description || '',
        itemStatus: 'pending',
        rejectionReason: '',
        receiptNumber: null,
        receiptGenerated: false,
        reviewDate: null,
        reviewedBy: null
      };
    });

    const totalBudgetAmount = processedExpenses.reduce((sum, exp) => sum + exp.budgetAmount, 0);
    const totalActualAmount = processedExpenses.reduce((sum, exp) => sum + exp.actualAmount, 0);

    // Update event with claim bill
    const updatedEvent = await Event.findByIdAndUpdate(eventId, { 
      claimSubmitted: true,
      'claimBill.expenses': processedExpenses,
      'claimBill.totalBudgetAmount': totalBudgetAmount,
      'claimBill.totalExpenditure': totalActualAmount,
      'claimBill.status': 'pending',
      'claimBill.submissionDate': new Date(),
      'claimBill.createdAt': new Date()
    }, { new: true }).populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Claim submitted successfully',
      claim: {
        _id: updatedEvent._id,
        eventId: {
          _id: updatedEvent._id,
          title: updatedEvent.title,
          startDate: updatedEvent.startDate,
          endDate: updatedEvent.endDate
        },
        submittedBy: {
          _id: updatedEvent.createdBy._id,
          name: updatedEvent.createdBy.name,
          email: updatedEvent.createdBy.email
        },
        expenses: processedExpenses,
        totalBudgetAmount,
        totalActualAmount,
        status: 'pending',
        submissionDate: new Date()
      }
    });

  } catch (error) {
    console.error('Error submitting claim:', error);
    res.status(500).json({ 
      message: 'Error submitting claim', 
      error: error.message 
    });
  }
});

// Get all claims for coordinator
export const getCoordinatorClaims = asyncHandler(async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Build query to find events that have claim bills
    let eventQuery = { 
      'claimBill': { $exists: true }
    };

    // Add status filter if provided
    if (status && status !== 'all') {
      eventQuery['claimBill.status'] = status;
    }

    // Get events with claim bills
    const coordinatorEvents = await Event.find(eventQuery)
      .populate('createdBy', 'name email')
      .select('title startDate endDate budget claimBill createdAt')
      .sort({ 'claimBill.submissionDate': -1, createdAt: -1 });

    // Calculate pagination
    const totalClaims = coordinatorEvents.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedEvents = coordinatorEvents.slice(skip, skip + parseInt(limit));

    // Convert events to claim format
    const claims = paginatedEvents.map(event => ({
      _id: event._id,
      eventId: {
        _id: event._id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        budget: event.budget
      },
      submittedBy: {
        _id: event.createdBy?._id || '',
        name: event.createdBy?.name || 'Coordinator',
        email: event.createdBy?.email || ''
      },
      expenses: event.claimBill.expenses || [],
      totalBudgetAmount: event.claimBill.totalBudgetAmount || 0,
      totalActualAmount: event.claimBill.totalExpenditure || 0,
      status: event.claimBill.status || 'pending',
      submissionDate: event.claimBill.submissionDate || event.claimBill.createdAt || event.createdAt,
      reviewedBy: event.claimBill.approvedBy ? {
        _id: event.claimBill.approvedBy,
        name: 'HOD',
        email: ''
      } : null,
      reviewDate: event.claimBill.approvalDate || null,
      reviewComments: event.claimBill.approvalComments || ''
    }));

    res.json({
      claims,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalClaims / parseInt(limit)),
        totalClaims,
        hasNext: skip + claims.length < totalClaims,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error fetching coordinator claims:', error);
    res.status(500).json({ 
      message: 'Error fetching claims', 
      error: error.message 
    });
  }
});

// Get claim by ID
export const getClaimById = asyncHandler(async (req, res) => {
  try {
    const { claimId } = req.params;
    const coordinatorId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(claimId)) {
      return res.status(400).json({ message: 'Invalid claim ID' });
    }

    // Find event by ID (claimId is actually eventId in our system)
    const event = await Event.findById(claimId)
      .populate('createdBy', 'name email department');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if coordinator has permission to view this claim
    const hasPermission = event.createdBy._id.toString() === coordinatorId.toString();

    if (!hasPermission) {
      return res.status(403).json({ message: 'Not authorized to view this claim' });
    }

    // Convert event to claim format
    const claim = {
      _id: event._id,
      eventId: {
        _id: event._id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        budget: event.budget,
        venue: event.venue
      },
      submittedBy: {
        _id: event.createdBy._id,
        name: event.createdBy.name,
        email: event.createdBy.email,
        department: event.createdBy.department
      },
      expenses: event.claimBill?.expenses || [],
      totalBudgetAmount: event.claimBill?.totalBudgetAmount || 0,
      totalActualAmount: event.claimBill?.totalExpenditure || 0,
      status: event.claimBill?.status || 'pending',
      submissionDate: event.claimBill?.submissionDate || event.createdAt,
      reviewedBy: event.claimBill?.approvedBy ? {
        _id: event.claimBill.approvedBy,
        name: 'HOD',
        email: ''
      } : null,
      reviewDate: event.claimBill?.approvalDate || null,
      reviewComments: event.claimBill?.approvalComments || '',
      approvalHistory: []
    };

    res.json(claim);

  } catch (error) {
    console.error('Error fetching claim:', error);
    res.status(500).json({ 
      message: 'Error fetching claim', 
      error: error.message 
    });
  }
});

// Update claim status (approve/reject) - Only for coordinators
export const updateClaimStatus = asyncHandler(async (req, res) => {
  try {
    const { claimId } = req.params;
    const { status, comments } = req.body;
    const reviewerId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(claimId)) {
      return res.status(400).json({ message: 'Invalid claim ID' });
    }

    if (!['approved', 'rejected', 'under_review'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find event by ID (claimId is actually eventId in our system)
    const event = await Event.findById(claimId).populate('createdBy', 'name email');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user has permission to update this claim
    const hasPermission = event.createdBy._id.toString() === reviewerId.toString() ||
                         req.user.role === 'hod' || req.user.role === 'admin';

    if (!hasPermission) {
      return res.status(403).json({ message: 'Not authorized to update this claim' });
    }

    // Update event's claim bill status
    const updatedEvent = await Event.findByIdAndUpdate(claimId, {
      'claimBill.status': status,
      'claimBill.approvedBy': reviewerId,
      'claimBill.approvalDate': new Date(),
      'claimBill.approvalComments': comments || ''
    }, { new: true }).populate('createdBy', 'name email');

    // Convert to claim format for response
    const updatedClaim = {
      _id: updatedEvent._id,
      eventId: {
        _id: updatedEvent._id,
        title: updatedEvent.title,
        startDate: updatedEvent.startDate,
        endDate: updatedEvent.endDate
      },
      submittedBy: {
        _id: updatedEvent.createdBy._id,
        name: updatedEvent.createdBy.name,
        email: updatedEvent.createdBy.email
      },
      status: status,
      reviewedBy: {
        _id: reviewerId,
        name: req.user.name,
        email: req.user.email
      },
      reviewDate: new Date(),
      reviewComments: comments || ''
    };

    res.json({
      message: `Claim ${status} successfully`,
      claim: updatedClaim
    });

  } catch (error) {
    console.error('Error updating claim status:', error);
    res.status(500).json({ 
      message: 'Error updating claim status', 
      error: error.message 
    });
  }
});

// Get claim statistics
export const getClaimStatistics = asyncHandler(async (req, res) => {
  try {
    console.log('📊 Starting claim statistics calculation...');
    
    // Get events with claim bills and calculate real statistics
    const coordinatorEvents = await Event.find({ 
      'claimBill': { $exists: true }
    }).select('claimBill title startDate endDate createdAt');

    console.log('📊 Found events with claim bills:', coordinatorEvents.length);

    // Calculate statistics with safe defaults
    const totalClaims = coordinatorEvents.length || 0;
    const pendingClaims = coordinatorEvents.filter(event => 
      event.claimBill?.status === 'pending'
    ).length || 0;
    const approvedClaims = coordinatorEvents.filter(event => 
      event.claimBill?.status === 'approved'
    ).length || 0;
    const rejectedClaims = coordinatorEvents.filter(event => 
      event.claimBill?.status === 'rejected'
    ).length || 0;

    // Calculate financial statistics with safe parsing
    const totalBudgetAmount = coordinatorEvents.reduce((sum, event) => {
      const amount = Number(event.claimBill?.totalBudgetAmount) || 0;
      return sum + amount;
    }, 0);
    
    const totalActualAmount = coordinatorEvents.reduce((sum, event) => {
      const amount = Number(event.claimBill?.totalExpenditure) || 0;
      return sum + amount;
    }, 0);
    
    const totalSavings = totalBudgetAmount - totalActualAmount;

    // Recent claims with safe data handling
    const recentClaims = coordinatorEvents
      .sort((a, b) => {
        const dateA = new Date(a.claimBill?.submissionDate || a.createdAt || 0);
        const dateB = new Date(b.claimBill?.submissionDate || b.createdAt || 0);
        return dateB - dateA;
      })
      .slice(0, 5)
      .map(event => ({
        _id: String(event._id || ''),
        eventId: {
          _id: String(event._id || ''),
          title: String(event.title || 'Untitled Event')
        },
        submittedBy: {
          name: 'Coordinator'
        },
        status: String(event.claimBill?.status || 'pending'),
        submissionDate: event.claimBill?.submissionDate || event.createdAt || new Date().toISOString(),
        totalActualAmount: Number(event.claimBill?.totalExpenditure) || 0
      }));

    // Create response with guaranteed structure
    const response = {
      totalClaims: Number(totalClaims),
      pendingClaims: Number(pendingClaims),
      approvedClaims: Number(approvedClaims),
      rejectedClaims: Number(rejectedClaims),
      amounts: {
        totalBudgetAmount: Number(totalBudgetAmount),
        totalActualAmount: Number(totalActualAmount),
        totalSavings: Number(totalSavings)
      },
      recentClaims: recentClaims
    };

    console.log('📊 Sending response with structure:', Object.keys(response));
    console.log('📊 Amounts structure:', Object.keys(response.amounts));
    
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error fetching claim statistics:', error);
    
    // Return a safe fallback response even on error
    const fallbackResponse = {
      totalClaims: 0,
      pendingClaims: 0,
      approvedClaims: 0,
      rejectedClaims: 0,
      amounts: {
        totalBudgetAmount: 0,
        totalActualAmount: 0,
        totalSavings: 0
      },
      recentClaims: []
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200);
    res.end(JSON.stringify(fallbackResponse));
  }
});

// Get claims for a specific event
export const getEventClaims = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    // Verify event exists
    const event = await Event.findById(eventId).populate('createdBy', 'name email');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Convert event claimBill to claim format if it exists
    const claims = [];
    if (event.claimBill && event.claimBill.expenses && event.claimBill.expenses.length > 0) {
      claims.push({
        _id: event._id,
        eventId: {
          _id: event._id,
          title: event.title,
          startDate: event.startDate,
          endDate: event.endDate,
          budget: event.budget
        },
        submittedBy: {
          _id: event.createdBy._id,
          name: event.createdBy.name,
          email: event.createdBy.email
        },
        expenses: event.claimBill.expenses,
        totalBudgetAmount: event.claimBill.totalBudgetAmount || 0,
        totalActualAmount: event.claimBill.totalExpenditure || 0,
        status: event.claimBill.status || 'pending',
        submissionDate: event.claimBill.submissionDate || event.claimBill.createdAt || event.createdAt,
        reviewedBy: event.claimBill.approvedBy ? {
          _id: event.claimBill.approvedBy,
          name: 'HOD',
          email: ''
        } : null,
        reviewDate: event.claimBill.approvalDate || null,
        reviewComments: event.claimBill.approvalComments || ''
      });
    }

    res.json(claims);

  } catch (error) {
    console.error('Error fetching event claims:', error);
    res.status(500).json({ 
      message: 'Error fetching event claims', 
      error: error.message 
    });
  }
});

// Get programme details for claim submission
export const getProgrammeForClaim = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const coordinatorId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user has permission
    const hasPermission = event.createdBy.toString() === coordinatorId.toString();
    if (!hasPermission) {
      return res.status(403).json({ message: 'Not authorized to access this event' });
    }

    // Check if event is approved and completed
    if (event.status !== 'approved') {
      return res.status(400).json({ message: 'Event must be approved before submitting claims' });
    }

    const eventEndDate = new Date(event.endDate);
    const currentDate = new Date();
    if (eventEndDate > currentDate) {
      return res.status(400).json({ message: 'Cannot submit claim before event completion' });
    }

    // Return event details with budget breakdown for claim
    res.json({
      _id: event._id,
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      budget: event.budget,
      budgetBreakdown: event.budgetBreakdown,
      claimSubmitted: event.claimSubmitted
    });

  } catch (error) {
    console.error('Error fetching programme for claim:', error);
    res.status(500).json({ 
      message: 'Error fetching programme details', 
      error: error.message 
    });
  }
});
import asyncHandler from 'express-async-handler';
import NoteOrder from '../../../shared/models/noteOrderModel.js';
import Event from '../../../shared/models/eventModel.js';

export const getNoteOrder = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const note = await NoteOrder.findOne({ eventId }).populate('entries.author', 'name email role');
  if (!note) return res.status(404).json({ message: 'Note Order not found' });
  res.json(note);
});

export const addNoteEntry = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { type = 'instruction', message } = req.body;
  const note = await NoteOrder.findOne({ eventId });
  if (!note) return res.status(404).json({ message: 'Note Order not found' });
  if (note.locked) return res.status(400).json({ message: 'Note Order is locked' });

  note.entries.push({ type, message, author: req.user?._id });
  await note.save();
  const populated = await NoteOrder.findById(note._id).populate('entries.author', 'name email role');
  res.status(201).json(populated);
});

export const lockNoteOrder = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const note = await NoteOrder.findOneAndUpdate(
    { eventId },
    { $set: { locked: true } },
    { new: true }
  );
  if (!note) return res.status(404).json({ message: 'Note Order not found' });
  res.json(note);
});

export const updatePlannedBudget = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { income = [], expenses = [] } = req.body;
  const note = await NoteOrder.findOne({ eventId });
  if (!note) return res.status(404).json({ message: 'Note Order not found' });
  if (note.locked) return res.status(400).json({ message: 'Note Order is locked' });

  // Recompute totals
  const computedIncome = income.map(i => {
    const p = Number(i.expectedParticipants || 0);
    const a = Number(i.perParticipantAmount || 0);
    const g = Number(i.gstPercentage || 0);
    const incomeVal = p * a * (1 - g / 100);
    return { ...i, income: Math.round(incomeVal * 100) / 100 };
  });
  const totalIncome = computedIncome.reduce((s, i) => s + Number(i.income || 0), 0);
  const computedExpenses = expenses.map(e => ({ category: e.category, amount: Number(e.amount || 0) }));
  const totalExpenditure = computedExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const universityOverhead = Math.round(totalIncome * 0.30 * 100) / 100;

  note.income = computedIncome;
  note.expenses = computedExpenses;
  note.totalIncome = totalIncome;
  note.totalExpenditure = totalExpenditure;
  note.universityOverhead = universityOverhead;
  await note.save();

  res.json(note);
});

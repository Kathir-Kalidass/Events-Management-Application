import mongoose from 'mongoose';

const errorRecordSchema = mongoose.Schema({
  message: { type: String, required: true },
  stack: String,
  method: String,
  url: String,
  statusCode: Number,
  user: String,
  resolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

errorRecordSchema.index({ createdAt: -1 });
errorRecordSchema.index({ resolved: 1 });

const ErrorRecord = mongoose.model('ErrorRecord', errorRecordSchema);
export default ErrorRecord;

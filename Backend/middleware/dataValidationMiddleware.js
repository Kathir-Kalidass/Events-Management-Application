import { scheduledDataCleanup } from '../utils/dataValidation.js';

/**
 * Middleware to run data validation and cleanup
 */

let validationInterval = null;

/**
 * Initialize data validation middleware
 * @param {Object} options - Configuration options
 */
export const initializeDataValidation = (options = {}) => {
  const {
    runOnStartup = true,
    intervalMinutes = 60, // Run every hour by default
    autoFix = false
  } = options;

  console.log('🔧 Initializing data validation middleware...');

  // Run validation on startup
  if (runOnStartup) {
    setTimeout(async () => {
      try {
        console.log('🚀 Running startup data validation...');
        await scheduledDataCleanup();
        console.log('✅ Startup data validation completed');
      } catch (error) {
        console.error('❌ Startup data validation failed:', error.message);
      }
    }, 5000); // Wait 5 seconds after startup
  }

  // Set up periodic validation
  if (intervalMinutes > 0) {
    validationInterval = setInterval(async () => {
      try {
        console.log('⏰ Running scheduled data validation...');
        await scheduledDataCleanup();
        console.log('✅ Scheduled data validation completed');
      } catch (error) {
        console.error('❌ Scheduled data validation failed:', error.message);
      }
    }, intervalMinutes * 60 * 1000);

    console.log(`📅 Scheduled data validation every ${intervalMinutes} minutes`);
  }
};

/**
 * Stop the data validation interval
 */
export const stopDataValidation = () => {
  if (validationInterval) {
    clearInterval(validationInterval);
    validationInterval = null;
    console.log('🛑 Data validation interval stopped');
  }
};

/**
 * Express middleware to validate data on specific routes
 */
export const validateDataMiddleware = (options = {}) => {
  const { autoFix = false } = options;

  return async (req, res, next) => {
    try {
      // Only run validation on specific routes or conditions
      const shouldValidate = req.path.includes('/participants') || req.query.validate === 'true';
      
      if (shouldValidate) {
        console.log('🔍 Running data validation middleware...');
        const { validateDataIntegrity } = await import('../utils/dataValidation.js');
        
        const report = await validateDataIntegrity({ 
          autoFix,
          checkParticipantEvents: true 
        });
        
        // Add validation report to request for use in controllers
        req.validationReport = report;
        
        if (report.summary.totalIssues > 0) {
          console.warn(`⚠️ Found ${report.summary.totalIssues} data integrity issues`);
        }
      }
      
      next();
    } catch (error) {
      console.error('❌ Data validation middleware error:', error.message);
      // Don't block the request, just log the error
      next();
    }
  };
};

export default {
  initializeDataValidation,
  stopDataValidation,
  validateDataMiddleware
};